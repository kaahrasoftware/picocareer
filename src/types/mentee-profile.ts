
export type AcademicStatus = 'current_student' | 'gap_year' | 'graduated' | 'transfer_student' | 'prospective_student';
export type CourseStatus = 'completed' | 'in_progress' | 'planned' | 'dropped';
export type ProjectStatus = 'completed' | 'in_progress' | 'planned' | 'on_hold';
export type EssayPromptCategory = 'college_application' | 'scholarship' | 'personal_statement' | 'supplemental' | 'creative_writing' | 'academic_reflection';
export type InterestCategory = 'career' | 'academic' | 'extracurricular' | 'hobby' | 'industry' | 'skill';

export interface EssayPrompt {
  id: string;
  title: string;
  prompt_text: string;
  category: EssayPromptCategory;
  word_limit?: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeEssayResponse {
  id: string;
  mentee_id: string;
  prompt_id: string;
  response_text?: string;
  word_count: number;
  is_draft: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  prompt?: EssayPrompt;
}

export interface MenteeCourse {
  id: string;
  mentee_id: string;
  course_name: string;
  course_code?: string;
  credits?: number;
  semester?: string;
  year?: number;
  grade?: string;
  status: CourseStatus;
  instructor_name?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description?: string;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  technologies?: string[];
  github_url?: string;
  live_demo_url?: string;
  image_urls?: string[];
  collaborators?: string[];
  skills_used?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenteeAcademicRecord {
  id: string;
  mentee_id: string;
  semester: string;
  year: number;
  semester_gpa?: number;
  cumulative_gpa?: number;
  credits_attempted?: number;
  credits_earned?: number;
  class_rank?: number;
  honors?: string[];
  awards?: string[];
  created_at: string;
  updated_at: string;
}

export interface MenteeInterest {
  id: string;
  mentee_id: string;
  interest_name: string;
  category: InterestCategory;
  description?: string;
  proficiency_level?: string;
  related_career_id?: string;
  related_major_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ExtendedMenteeProfile {
  city?: string;
  country?: string;
  current_gpa?: number;
  graduation_year?: number;
  academic_status?: AcademicStatus;
  class_rank?: number;
  total_credits?: number;
  courses?: MenteeCourse[];
  projects?: MenteeProject[];
  academic_records?: MenteeAcademicRecord[];
  interests?: MenteeInterest[];
  essay_responses?: MenteeEssayResponse[];
}
