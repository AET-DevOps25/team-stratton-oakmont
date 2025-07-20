// API calls related to study plans
import { STUDY_PLAN_API_URL } from "../config/api";
import { PROGRAM_CATALOG_API_URL } from "../config/api";

// TypeScript interfaces for the API response
export interface StudyPlanDto {
  id: number;
  name: string;
  userId: number;
  isActive: boolean;
  createDate: string;
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
  studyProgramName?: string;
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

// Helper function to get authenticated headers
const getAuthHeaders = (): { [key: string]: string } => {
  const token = localStorage.getItem("jwtToken");

  if (!token) {
    throw new StudyPlanApiError(
      401,
      "NO_TOKEN",
      "No authentication token found"
    );
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

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

  return data;
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
      "UNAUTHORIZED",
      "No authentication token found"
    );
  }

  const response = await fetch(`${STUDY_PLAN_API_URL}/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

// ============================================================================
// SEMESTER AND COURSE API FUNCTIONS
// ============================================================================

// Interfaces for Semesters and Courses
export interface SemesterDto {
  id?: number;
  name: string;
  studyPlanId: number;
  semesterOrder: number;
  winterOrSummer?: string; // "WINTER" or "SUMMER"
  courses?: SemesterCourseDto[];
}

export interface SemesterCourseDto {
  id?: number;
  semesterId: number;
  courseId: string;
  isCompleted: boolean;
  completionDate?: string;
  courseOrder: number;
  courseName?: string;
  courseCode?: string;
  credits?: number;
  professor?: string;
  occurrence?: string;
  category?: string;
  subcategory?: string;
}

export interface CreateSemesterRequest {
  name: string;
  studyPlanId: number;
  semesterOrder: number;
  winterOrSummer?: string;
}

export interface CreateSemesterCourseRequest {
  semesterId: number;
  courseId: string;
  courseOrder: number;
  isCompleted?: boolean;
}

// SEMESTER API FUNCTIONS

export const createSemester = async (
  request: CreateSemesterRequest
): Promise<SemesterDto> => {
  try {
    const response = await fetch(`${STUDY_PLAN_API_URL}/semesters`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "SEMESTER_CREATION_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterDto;
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to create semester: ${error}`
    );
  }
};

export const getSemestersByStudyPlan = async (
  studyPlanId: number
): Promise<SemesterDto[]> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semesters/study-plan/${studyPlanId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "SEMESTER_FETCH_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterDto[];
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to fetch semesters: ${error}`
    );
  }
};

export const updateSemester = async (
  semesterId: number,
  updates: Partial<SemesterDto>
): Promise<SemesterDto> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semesters/${semesterId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "SEMESTER_UPDATE_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterDto;
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to update semester: ${error}`
    );
  }
};

export const deleteSemester = async (semesterId: number): Promise<void> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semesters/${semesterId}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "SEMESTER_DELETE_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to delete semester: ${error}`
    );
  }
};

// SEMESTER COURSE API FUNCTIONS

export const createSemesterCourse = async (
  request: CreateSemesterCourseRequest
): Promise<SemesterCourseDto> => {
  try {
    const response = await fetch(`${STUDY_PLAN_API_URL}/semester-courses`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "COURSE_CREATION_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterCourseDto;
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to create course: ${error}`
    );
  }
};

export const getCoursesBySemester = async (
  semesterId: number
): Promise<SemesterCourseDto[]> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semester-courses/semester/${semesterId}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "COURSE_FETCH_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterCourseDto[];
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to fetch courses: ${error}`
    );
  }
};

export const updateSemesterCourse = async (
  courseId: number,
  updates: Partial<SemesterCourseDto>
): Promise<SemesterCourseDto> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semester-courses/${courseId}`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "COURSE_UPDATE_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterCourseDto;
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to update course: ${error}`
    );
  }
};

export const deleteSemesterCourse = async (courseId: number): Promise<void> => {
  const token = localStorage.getItem("jwtToken");
  if (!token) {
    throw new StudyPlanApiError(
      401,
      "UNAUTHORIZED",
      "No authentication token found"
    );
  }

  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semester-courses/${courseId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "COURSE_DELETE_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to delete course: ${error}`
    );
  }
};

export const toggleSemesterCourseCompletion = async (
  courseId: number
): Promise<SemesterCourseDto> => {
  try {
    const response = await fetch(
      `${STUDY_PLAN_API_URL}/semester-courses/${courseId}/completion`,
      {
        method: "PUT",
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText) as ApiError;
        throw new StudyPlanApiError(
          response.status,
          errorData.error,
          errorData.message
        );
      } catch {
        throw new StudyPlanApiError(
          response.status,
          "COURSE_COMPLETION_UPDATE_FAILED",
          `HTTP ${response.status}: ${errorText}`
        );
      }
    }

    return (await response.json()) as SemesterCourseDto;
  } catch (error) {
    if (error instanceof StudyPlanApiError) {
      throw error;
    }
    throw new StudyPlanApiError(
      500,
      "NETWORK_ERROR",
      `Failed to toggle course completion: ${error}`
    );
  }
};

// Bulk operations
export const createMultipleCourses = async (
  courses: CreateSemesterCourseRequest[]
): Promise<SemesterCourseDto[]> => {
  const results: SemesterCourseDto[] = [];
  for (const course of courses) {
    try {
      const result = await createSemesterCourse(course);
      results.push(result);
    } catch (error) {
      console.error(`Failed to create course ${course.courseId}:`, error);
      throw error; // Re-throw to stop the process on first failure
    }
  }
  return results;
};
