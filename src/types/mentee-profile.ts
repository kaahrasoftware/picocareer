
export interface MenteeCourse {
  id: string;
  mentee_id: string;
  course_name: string;
  course_code?: string;
  grade?: string;
  credits?: number;
  semester: string;
  year: number;
  institution?: string;
  description?: string;
  status: CourseStatus;
  instructor_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeProject {
  id: string;
  mentee_id: string;
  title: string;
  description: string;
  start_date: string;
  end_date?: string;
  status: 'completed' | 'in_progress' | 'planned' | 'on_hold';
  technologies?: string[];
  role?: string;
  achievements?: string;
  project_url?: string;
  github_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeAcademicRecord {
  id: string;
  mentee_id: string;
  institution_name: string;
  degree_type: string;
  major: string;
  minor?: string;
  gpa?: number;
  semester_gpa?: number;
  cumulative_gpa?: number;
  credits_attempted?: number;
  credits_earned?: number;
  class_rank?: string;
  graduation_date?: string;
  honors?: string[];
  awards?: string[];
  relevant_coursework?: string[];
  thesis_topic?: string;
  year: number;
  semester: string;
  created_at: string;
  updated_at: string;
}

export interface MenteeInterest {
  id: string;
  mentee_id: string;
  category: InterestCategory;
  interest_name: string;
  description?: string;
  proficiency_level?: string;
  related_career_id?: string;
  related_major_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EssayPrompt {
  id: string;
  title: string;
  category: 'personal_statement' | 'why_school' | 'why_major' | 'extracurricular' | 'challenge' | 'diversity' | 'other';
  prompt_text: string;
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
  response_text: string;
  word_count?: number;
  status: 'draft' | 'completed' | 'reviewed';
  feedback?: string;
  score?: number;
  created_at: string;
  updated_at: string;
  prompt?: EssayPrompt;
}

// Type definitions
export type CourseStatus = 'completed' | 'in_progress' | 'planned' | 'dropped';
export type AcademicStatus = 'undergraduate' | 'graduate' | 'postgraduate' | 'high_school';
export type InterestCategory = 'career' | 'academic' | 'extracurricular' | 'hobby' | 'industry' | 'skill';
