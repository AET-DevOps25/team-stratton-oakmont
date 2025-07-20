import { PROGRAM_CATALOG_API_URL } from "../config/api";
export interface ModuleDetails {
  id: number;
  studyProgramId: number;
  category: string;
  subcategory: string;
  courseIdAndName: string;
  moduleId: string;
  name: string;
  credits: number;
  responsible: string;
  organisation: string;
  moduleLevel: string;
  occurrence: string;
  language: string;
  totalHours?: number;
  contactHours?: number;
  selfStudyHours?: number;
  descriptionOfAchievementAndAssessmentMethods?: string;
  examRetakeNextSemester?: string;
  examRetakeAtTheEndOfSemester?: string;
  prerequisitesRecommended?: string;
  intendedLearningOutcomes?: string;
  content?: string;
  teachingAndLearningMethods?: string;
  media?: string;
  readingList?: string;
}

export interface ModuleSummaryDto {
  id: number;
  moduleId: string;
  name: string;
  credits: number;
  category: string;
  subcategory: string;
  occurrence: string;
  language: string;
  responsible: string;
  description?: string;
}

export interface CategoryStatisticsDto {
  category: string;
  totalCredits: number;
  moduleCount: number;
  subcategories: string[];
  modules: ModuleSummaryDto[];
}

export interface CurriculumOverviewDto {
  studyProgramId: number;
  programName: string;
  totalCredits: number;
  totalModules: number;
  categories: CategoryStatisticsDto[];
  availableLanguages: string[];
  availableOccurrences: string[];
}

// Convert ModuleDetails to Course interface for frontend compatibility
export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  semester: string;
  language: string;
  professor: string;
  occurrence: string;
  description?: string;
  prerequisites?: string[];
  category: string;
  subcategory?: string;
  subSubcategory?: string;
}

class ModuleDetailsAPI {
  /**
   * Get curriculum overview with statistics
   */
  async getCurriculumOverview(
    studyProgramId: number
  ): Promise<CurriculumOverviewDto> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/overview`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch curriculum overview: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Get category statistics
   */
  async getCategoryStatistics(
    studyProgramId: number
  ): Promise<CategoryStatisticsDto[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/category-stats`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch category statistics: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Get all modules for a study program
   */
  async getModulesByStudyProgram(
    studyProgramId: number
  ): Promise<ModuleDetails[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch modules: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get modules by category
   */
  async getModulesByCategory(
    studyProgramId: number,
    category: string
  ): Promise<ModuleDetails[]> {
    const encodedCategory = encodeURIComponent(category);
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/category/${encodedCategory}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch modules by category: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Get module summaries by category
   */
  async getModuleSummariesByCategory(
    studyProgramId: number,
    category: string
  ): Promise<ModuleSummaryDto[]> {
    const encodedCategory = encodeURIComponent(category);
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/category/${encodedCategory}/summaries`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch module summaries: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Advanced search with filters
   */
  async advancedSearch(
    studyProgramId: number,
    filters: {
      category?: string;
      subcategory?: string;
      language?: string;
      occurrence?: string;
      minCredits?: number;
      maxCredits?: number;
      searchTerm?: string;
    }
  ): Promise<ModuleDetails[]> {
    const params = new URLSearchParams();
    if (filters.category) params.append("category", filters.category);
    if (filters.subcategory) params.append("subcategory", filters.subcategory);
    if (filters.language) params.append("language", filters.language);
    if (filters.occurrence) params.append("occurrence", filters.occurrence);
    if (filters.minCredits)
      params.append("minCredits", filters.minCredits.toString());
    if (filters.maxCredits)
      params.append("maxCredits", filters.maxCredits.toString());
    if (filters.searchTerm) params.append("searchTerm", filters.searchTerm);

    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/advanced-search?${params}`
    );
    if (!response.ok) {
      throw new Error(`Failed to search modules: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get modules by semester availability
   */
  async getModulesBySemester(
    studyProgramId: number,
    semester: string
  ): Promise<ModuleDetails[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/semester/${semester}`
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch modules by semester: ${response.statusText}`
      );
    }
    return response.json();
  }

  /**
   * Get distinct categories
   */
  async getDistinctCategories(studyProgramId: number): Promise<string[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/categories`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get distinct subcategories for a category
   */
  async getDistinctSubcategories(
    studyProgramId: number,
    category: string
  ): Promise<string[]> {
    const encodedCategory = encodeURIComponent(category);
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/categories/${encodedCategory}/subcategories`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch subcategories: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get distinct languages
   */
  async getDistinctLanguages(studyProgramId: number): Promise<string[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/languages`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get distinct occurrences
   */
  async getDistinctOccurrences(studyProgramId: number): Promise<string[]> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/study-program/${studyProgramId}/occurrences`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch occurrences: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Get module details by module ID
   */
  async getModuleDetailsByModuleId(
    moduleId: string
  ): Promise<ModuleDetails | null> {
    const response = await fetch(
      `${PROGRAM_CATALOG_API_URL}/modules/module/${moduleId}`
    );
    if (response.status === 404) {
      return null;
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch module details: ${response.statusText}`);
    }
    return response.json();
  }

  /**
   * Convert ModuleDetails to Course for frontend compatibility
   */
  convertModuleDetailsToCourse(module: ModuleDetails): Course {
    return {
      id: module.id.toString(),
      name: module.name,
      code: module.moduleId,
      credits: module.credits,
      semester: this.extractSemesterFromOccurrence(module.occurrence),
      language: module.language,
      professor: module.responsible,
      occurrence: module.occurrence,
      description:
        module.intendedLearningOutcomes ||
        module.content ||
        "No description available",
      prerequisites: this.parsePrerequisites(module.prerequisitesRecommended),
      category: module.category,
      subcategory: module.subcategory,
    };
  }

  /**
   * Convert ModuleSummaryDto to Course for frontend compatibility
   */
  convertModuleSummaryToCourse(summary: ModuleSummaryDto): Course {
    return {
      id: summary.id.toString(),
      name: summary.name,
      code: summary.moduleId,
      credits: summary.credits,
      semester: this.extractSemesterFromOccurrence(summary.occurrence),
      language: summary.language,
      professor: summary.responsible,
      occurrence: summary.occurrence,
      description: summary.description || "No description available",
      category: summary.category,
      subcategory: summary.subcategory,
    };
  }

  /**
   * Extract semester information from occurrence string
   */
  private extractSemesterFromOccurrence(occurrence: string): string {
    const lowerOccurrence = occurrence.toLowerCase();
    if (
      lowerOccurrence.includes("winter") &&
      lowerOccurrence.includes("summer")
    ) {
      return "Any";
    } else if (lowerOccurrence.includes("winter")) {
      return "Winter";
    } else if (lowerOccurrence.includes("summer")) {
      return "Summer";
    }
    return "Any";
  }

  /**
   * Parse prerequisites string into array
   */
  private parsePrerequisites(prerequisites?: string): string[] {
    if (
      !prerequisites ||
      prerequisites.trim() === "" ||
      prerequisites.toLowerCase().includes("none")
    ) {
      return [];
    }
    // Simple parsing - split by common delimiters and clean up
    return prerequisites
      .split(/[,;]/)
      .map((req) => req.trim())
      .filter((req) => req.length > 0 && !req.toLowerCase().includes("none"));
  }
}

export const moduleDetailsAPI = new ModuleDetailsAPI();
