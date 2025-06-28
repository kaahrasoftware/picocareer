
export interface MenteeEssayResponse {
  id: string;
  prompt_id: string;
  mentee_id: string;
  response_text: string;
  word_count?: number;
  is_draft: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  prompt?: {
    id: string;
    title: string;
    prompt_text: string;
    category: EssayPromptCategory;
    word_limit?: number;
  };
}

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description?: string;
  status: 'completed' | 'in_progress' | 'planned' | 'on_hold';
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
  year: number;
  semester: string;
  cumulative_gpa?: number;
  semester_gpa?: number;
  credits_earned?: number;
  credits_attempted?: number;
  class_rank?: number;
  honors?: string[];
  awards?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenteeCourse {
  id: string;
  mentee_id: string;
  course_name: string;
  course_code?: string;
  semester?: string;
  year?: number;
  grade?: string;
  credits?: number;
  instructor_name?: string;
  description?: string;
  status: CourseStatus;
  created_at: string;
  updated_at: string;
}

export type CourseStatus = 'completed' | 'in_progress' | 'planned' | 'dropped';
export type ProjectStatus = 'completed' | 'in_progress' | 'planned' | 'on_hold';
export type EssayPromptCategory = 'personal_statement' | 'supplemental' | 'scholarship' | 'college_application' | 'other';
export type InterestCategory = 'academic' | 'extracurricular' | 'professional' | 'personal' | 'career';
export type AcademicStatus = 'freshman' | 'sophomore' | 'junior' | 'senior' | 'graduate' | 'current_student' | 'gap_year' | 'graduated' | 'transfer_student' | 'prospective_student' | 'other';
