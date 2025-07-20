// Types for study program-related functionality

export interface StudyProgram {
  id: string; // Backend database ID as string
  name: string;
  degree: string;
  fieldOfStudy: string;
  credits: number | null;
  semesters: number | null;
  curriculumLink: string;
}

export interface StudyProgramDto {
  id: number;
  degree: string;
  curriculum: string;
  fieldOfStudies: string;
  ectsCredits: number | null;
  semester: number | null;
  curriculumLink: string;
  name: string;
}
