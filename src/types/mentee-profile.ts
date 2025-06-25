
export interface MenteeEssayResponse {
  id: string;
  prompt_id: string;
  mentee_id: string;
  response_text?: string;
  word_count?: number;
  is_draft: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  prompt?: {
    id: string;
    title: string;
    description: string;
    category: EssayPromptCategory;
  };
}

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
  collaborators?: string[];
  skills_used?: string[];
  technologies?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenteeAcademicRecord {
  id: string;
  mentee_id: string;
  institution_name: string;
  degree_type: string;
  major: string;
  gpa?: number;
  graduation_date?: string;
  status: AcademicStatus;
  created_at: string;
  updated_at: string;
}

export interface MenteeCourse {
  id: string;
  mentee_id: string;
  course_name: string;
  course_code?: string;
  instructor?: string;
  credits?: number;
  grade?: string;
  semester: string;
  year: number;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export type ProjectStatus = 'completed' | 'in_progress' | 'planned';
export type CourseStatus = 'completed' | 'in_progress' | 'enrolled' | 'dropped';
export type AcademicStatus = 'current' | 'graduated' | 'transferred' | 'withdrawn';
export type EssayPromptCategory = 'personal' | 'academic' | 'career' | 'extracurricular' | 'leadership';
export type InterestCategory = 'academic' | 'career' | 'personal' | 'extracurricular';
