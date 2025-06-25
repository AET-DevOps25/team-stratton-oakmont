// API calls related to study plans
const API_BASE_URL = 'http://localhost:8081/api/v1';

// TypeScript interfaces for the API response
export interface StudyPlanDto {
  id: number;
  name: string;
  userId: number;
  planData?: string;
  isActive: boolean;
  createdDate: string;
  lastModified: string;
  studyProgramId?: number;
  studyProgramName?: string;
}
export interface StudyProgramDto {
  id: number;
  name: string;
  degreeType: string;
  totalCredits: number;
  semesterDuration: number;
  description?: string;
}

export interface CreateStudyPlanRequest {
  name: string;
  studyProgramId: number;
  planData?: string;
}

export interface ApiError {
  error: string;
  message: string;
}

export class StudyPlanApiError extends Error {
  public statusCode: number;
  public error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = 'StudyPlanApiError';
    this.statusCode = statusCode;
    this.error = error;
  }
}

// API service function to get user's study plans
export const getMyStudyPlans = async (): Promise<StudyPlanDto[]> => {
  // Get JWT token from localStorage (matching the key used in AuthContext)
  const token = localStorage.getItem('jwtToken');
  
  if (!token) {
    throw new StudyPlanApiError(401, 'NO_TOKEN', 'No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/study-plans/my`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || 'FETCH_FAILED',
      data.message || 'Failed to fetch study plans'
    );
  }

  return data;
};

// API service function to get all study programs
export const getStudyPrograms = async (): Promise<StudyProgramDto[]> => {
  const response = await fetch(`${API_BASE_URL}/study-programs`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || 'FETCH_FAILED',
      data.message || 'Failed to fetch study programs'
    );
  }

  return data;
};

// API service function to create a new study plan
export const createStudyPlan = async (request: CreateStudyPlanRequest): Promise<StudyPlanDto> => {
  // Get JWT token from localStorage
  const token = localStorage.getItem('jwtToken');
  
  if (!token) {
    throw new StudyPlanApiError(401, 'NO_TOKEN', 'No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/study-plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || 'CREATE_FAILED',
      data.message || 'Failed to create study plan'
    );
  }

  return data;
};

// Additional utility function for error handling
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === 'object' && error !== null && 'error' in error && 'message' in error;
};