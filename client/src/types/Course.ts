// TypeScript interfaces for Course/Module Details
export interface CourseDto {
  id: number;
  name: string;
  credits: number;
  version: string;
  valid: string;
  responsible: string;
  organisation: string;
  note: string;
  moduleLevel: string;
  abbreviation: string;
  subtitle: string;
  duration: string;
  occurrence: string;
  language: string;
  relatedPrograms: string;
  totalHours: string;
  contactHours: string;
  selfStudyHours: string;
  descriptionOfAchievementAndAssessmentMethods: string;
  examRetakeNextSemester: string;
  examRetakeAtTheEndOfSemester: string;
  prerequisitesRecommended: string;
  intendedLearningOutcomes: string;
  content: string;
  teachingAndLearningMethods: string;
  media: string;
  readingList: string;
  curriculumId: string;
  transformedLink: string;
  extractionMethod: string;
}

// Simplified interface for course card display
export interface CourseCardData {
  id: number;
  name: string;
  credits: number;
  language: string;
  occurrence: string;
  moduleLevel: string;
  responsible: string;
  organisation: string;
  duration: string;
  abbreviation: string;
  subtitle: string;
}

// Interface for course search and filter parameters
export interface CourseSearchParams {
  searchTerm?: string;
  language?: string;
  credits?: number;
  occurrence?: string;
  moduleLevel?: string;
}

// Interface for course filter options
export interface CourseFilterOptions {
  languages: string[];
  creditOptions: number[];
  occurrences: string[];
  moduleLevels: string[];
}
