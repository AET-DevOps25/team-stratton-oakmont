// API calls related to courses/modules from program-catalog-service
import type { CourseDto, CourseSearchParams } from "../types/Course";

const API_BASE_URL = "http://localhost:8080/api/v1";

// Get all courses
export const getAllCourses = async (): Promise<CourseDto[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/module-details-scraped`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (id: string): Promise<CourseDto> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/module-details-scraped/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching course by ID:", error);
    throw error;
  }
};

// Search courses
export const searchCourses = async (
  searchTerm: string
): Promise<CourseDto[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/module-details-scraped/search?q=${encodeURIComponent(
        searchTerm
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching courses:", error);
    throw error;
  }
};

// Filter courses by language
export const getCoursesByLanguage = async (
  language: string
): Promise<CourseDto[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/module-details-scraped/filter/language/${encodeURIComponent(
        language
      )}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error filtering courses by language:", error);
    throw error;
  }
};

// Filter courses by credits
export const getCoursesByCredits = async (
  credits: string
): Promise<CourseDto[]> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/module-details-scraped/filter/credits/${credits}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error filtering courses by credits:", error);
    throw error;
  }
};

// Generic course filter function
export const filterCourses = async (
  params: CourseSearchParams
): Promise<CourseDto[]> => {
  try {
    // If we have a search term, use the search endpoint
    if (params.searchTerm) {
      return await searchCourses(params.searchTerm);
    }

    // If we have language filter, use the language endpoint
    if (params.language) {
      return await getCoursesByLanguage(params.language);
    }

    // If we have credits filter, use the credits endpoint
    if (params.credits) {
      return await getCoursesByCredits(params.credits.toString());
    }

    // Default to getting all courses
    return await getAllCourses();
  } catch (error) {
    console.error("Error filtering courses:", error);
    throw error;
  }
};

// Utility function to extract unique filter options from courses
export const extractFilterOptions = (courses: CourseDto[]) => {
  const languages = [
    ...new Set(courses.map((course) => course.language).filter(Boolean)),
  ];
  const creditOptions = [
    ...new Set(courses.map((course) => course.credits).filter(Boolean)),
  ];
  const occurrences = [
    ...new Set(courses.map((course) => course.occurrence).filter(Boolean)),
  ];
  const moduleLevels = [
    ...new Set(courses.map((course) => course.moduleLevel).filter(Boolean)),
  ];

  return {
    languages: languages.sort(),
    creditOptions: creditOptions.sort((a, b) => a - b),
    occurrences: occurrences.sort(),
    moduleLevels: moduleLevels.sort(),
  };
};
