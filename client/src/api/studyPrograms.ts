// API calls related to study programs
import { PROGRAM_CATALOG_API_URL } from "../config/api";
import type { StudyProgram, StudyProgramDto } from "../types/studyProgram";

// Re-export types for convenience
export type { StudyProgram, StudyProgramDto } from "../types/studyProgram";

export class StudyProgramApiError extends Error {
  public statusCode: number;
  public error: string;

  constructor(statusCode: number, error: string, message: string) {
    super(message);
    this.name = "StudyProgramApiError";
    this.statusCode = statusCode;
    this.error = error;
  }
}

// Convert backend DTO to frontend interface
const convertToStudyProgram = (dto: StudyProgramDto): StudyProgram => {
  return {
    id: dto.id.toString(), // Use backend ID directly as string
    name: dto.curriculum,
    degree: dto.degree,
    fieldOfStudy: dto.fieldOfStudies,
    credits: dto.ectsCredits,
    semesters: dto.semester,
    curriculumLink: dto.curriculumLink,
  };
};

// API service function to get all study programs
export const getAllStudyPrograms = async (): Promise<StudyProgram[]> => {
  try {
    const response = await fetch(`${PROGRAM_CATALOG_API_URL}/study-programs`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      let errorMessage = "Failed to fetch study programs";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // If parsing error response fails, use default message
      }
      throw new StudyProgramApiError(
        response.status,
        "FETCH_ERROR",
        errorMessage
      );
    }

    const studyPrograms: StudyProgramDto[] = await response.json();

    // Convert backend DTOs to frontend interface
    return studyPrograms.map(convertToStudyProgram);
  } catch (error) {
    if (error instanceof StudyProgramApiError) {
      throw error;
    }
    console.error("Error fetching study programs:", error);
    throw new StudyProgramApiError(
      500,
      "NETWORK_ERROR",
      "Network error occurred while fetching study programs"
    );
  }
};

// API service function to get a specific study program by ID
export const getStudyProgramById = async (
  id: string
): Promise<StudyProgram | null> => {
  try {
    const allPrograms = await getAllStudyPrograms();
    return allPrograms.find((program) => program.id === id) || null;
  } catch (error) {
    console.error("Error fetching study program by ID:", error);
    throw error;
  }
};
