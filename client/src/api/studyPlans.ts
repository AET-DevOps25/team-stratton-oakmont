// API calls related to study plans
import { STUDY_PLAN_API_URL } from "../config/api";
import { PROGRAM_CATALOG_API_URL } from "../config/api";

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
  degree: string;
  curriculum: string;
  fieldOfStudies: string;
  ectsCredits: number;
  semester: number;
  curriculumLink?: string;
  // Convenience properties for frontend compatibility
  name?: string; // Maps to curriculum
  fieldOfStudy?: string; // Maps to fieldOfStudies
  credits?: number; // Maps to ectsCredits
  semesters?: number; // Maps to semester
  language?: string;
  location?: string;
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
    this.name = "StudyPlanApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

// API service function to get user's study plans
export const getMyStudyPlans = async (): Promise<StudyPlanDto[]> => {
  // Get JWT token from localStorage (matching the key used in AuthContext)
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/my-study-plans`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "FETCH_FAILED",
      data.message || "Failed to fetch study plans"
    );
  }

  return data;
};

// API service function to get all study programs
export const getStudyPrograms = async (): Promise<StudyProgramDto[]> => {
  // Temporarily use program-catalog-service directly for testing
  const response = await fetch(`${PROGRAM_CATALOG_API_URL}/study-programs`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "FETCH_FAILED",
      data.message || "Failed to fetch study programs"
    );
  }

  // Transform the data to add compatibility properties
  return data.map((program: StudyProgramDto) => ({
    ...program,
    name: program.curriculum,
    fieldOfStudy: program.fieldOfStudies,
    credits: program.ectsCredits,
    semesters: program.semester,
    language: "English", // Default value - could be enhanced later
    location: "Munich", // Default value - could be enhanced later
  }));
};

// API service function to search study programs
export const searchStudyPrograms = async (
  degree?: string,
  curriculum?: string,
  fieldOfStudies?: string
): Promise<StudyProgramDto[]> => {
  const params = new URLSearchParams();
  if (degree) params.append("degree", degree);
  if (curriculum) params.append("curriculum", curriculum);
  if (fieldOfStudies) params.append("fieldOfStudies", fieldOfStudies);

  const url = `${STUDY_PLAN_API_URL}/study-programs/search${
    params.toString() ? `?${params.toString()}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "SEARCH_FAILED",
      data.message || "Failed to search study programs"
    );
  }

  // Transform the data to add compatibility properties
  return data.map((program: StudyProgramDto) => ({
    ...program,
    name: program.curriculum,
    fieldOfStudy: program.fieldOfStudies,
    credits: program.ectsCredits,
    semesters: program.semester,
    language: "English", // Default value - could be enhanced later
    location: "Munich", // Default value - could be enhanced later
  }));
};

// API service function to create a new study plan
export const createStudyPlan = async (
  request: CreateStudyPlanRequest
): Promise<StudyPlanDto> => {
  // Get JWT token from localStorage
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "CREATE_FAILED",
      data.message || "Failed to create study plan"
    );
  }

  return data;
};

// API service function to get a study plan by ID
export const getStudyPlanById = async (id: string): Promise<StudyPlanDto> => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "FETCH_FAILED",
      data.message || "Failed to fetch study plan"
    );
  }

  return data;
};

// API service function to get a study program by ID
export const getStudyProgramById = async (
  id: number
): Promise<StudyProgramDto> => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(
    `${PROGRAM_CATALOG_API_URL}/study-programs/${id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "FETCH_FAILED",
      data.message || "Failed to fetch study program"
    );
  }

  return data;
};

// API service function to delete a study plan
export const deleteStudyPlan = async (id: number): Promise<void> => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new StudyPlanApiError(
      response.status,
      data.error || "DELETE_FAILED",
      data.message || "Failed to delete study plan"
    );
  }
};

// API service function to rename a study plan
export const renameStudyPlan = async (
  id: number,
  name: string
): Promise<StudyPlanDto> => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/${id}/rename`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new StudyPlanApiError(
      response.status,
      data.error || "RENAME_FAILED",
      data.message || "Failed to rename study plan"
    );
  }

  return {
    id: parseInt(data.id),
    name: data.newName,
  } as StudyPlanDto;
};

// Additional utility function for error handling
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === "object" &&
    error !== null &&
    "error" in error &&
    "message" in error
  );
};
