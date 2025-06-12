
export interface CareerProfile {
  id: string;
  title: string;
  description: string;
  salary_range?: string;
  image_url?: string;
  industry?: string;
  profiles_count?: number;
  bookmark_id?: string;
}

export interface MajorProfile {
  id: string;
  title: string;
  description: string;
  degree_levels?: string[];
  featured?: boolean;
  potential_salary?: string;
  skill_match?: string[];
  tools_knowledge?: string[];
  common_courses?: string[];
  profiles_count?: number;
  learning_objectives?: string[];
  interdisciplinary_connections?: string[];
  job_prospects?: string;
  certifications_to_consider?: string[];
  affiliated_programs?: string[];
  gpa_expectations?: number;
  transferable_skills?: string[];
  passion_for_subject?: string;
  professional_associations?: string[];
  global_applicability?: string;
  common_difficulties?: string[];
  career_opportunities?: string[];
  intensity?: string;
  stress_level?: string;
  dropout_rates?: string;
  majors_to_consider_switching_to?: string[];
  created_at: string;
  updated_at: string;
  bookmark_id?: string;
}

export interface MentorProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  user_type?: string;
  position?: string;
  bio?: string;
  company_id?: string;
  location?: string;
  skills?: string[];
  top_mentor?: boolean;
  company_name?: string;
  career_title?: string;
  bookmark_id?: string;
}

export interface BookmarkedEntity {
  id: string;
  title?: string;
  description?: string;
  organization?: string;
  location?: string;
  deadline?: string;
  type?: string;
  status?: string;
  external_url?: string;
  bookmark_id: string;
}

export type BookmarkType = 'opportunity' | 'career' | 'mentor' | 'major';
