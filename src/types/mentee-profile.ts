
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
  status: 'completed' | 'in_progress' | 'planned';
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
  year?: number;
  semester?: string;
  status: CourseStatus;
  grade?: string;
  credits?: number;
  instructor_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type CourseStatus = 'completed' | 'in_progress' | 'planned' | 'dropped';
export type EssayPromptCategory = 'personal_statement' | 'scholarship' | 'application' | 'academic';
export type InterestCategory = 'academic' | 'career' | 'hobby' | 'volunteer' | 'research';
export type ProjectStatus = 'completed' | 'in_progress' | 'planned';
export type AcademicStatus = 'current' | 'graduated' | 'transferred' | 'on_leave';
