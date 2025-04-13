
export type BookmarkType = "mentor" | "career" | "major" | "scholarship";

export interface BookmarkedEntity {
  id: string;
}

export interface MentorProfile extends BookmarkedEntity {
  id: string;
  full_name: string;
  avatar_url: string | null;
  user_type: string;
  position: string | null;
  bio: string | null;
  company_id: string | null;
  location: string | null;
  skills: string[] | null;
  top_mentor: boolean | null;
  company_name?: string | null;
  career_title?: string | null;
}

export interface CareerProfile extends BookmarkedEntity {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  image_url: string | null;
  industry: string | null;
  profiles_count: number | null;
}

export interface MajorProfile extends BookmarkedEntity {
  id: string;
  title: string;
  description: string;
  degree_levels: string[] | null;
  featured: boolean | null;
  potential_salary: string | null;
  skill_match: string[] | null;
  tools_knowledge: string[] | null;
  common_courses: string[] | null;
  profiles_count: number | null;
  learning_objectives: string[] | null;
  interdisciplinary_connections: string[] | null;
  job_prospects: string | null;
  certifications_to_consider: string[] | null;
  affiliated_programs: string[] | null;
  gpa_expectations: number | null;
  transferable_skills: string[] | null;
  passion_for_subject: string | null;
  professional_associations: string[] | null;
  global_applicability: string | null;
  common_difficulties: string[] | null;
  career_opportunities: string[] | null;
  intensity: string | null;
  stress_level: string | null;
  dropout_rates: string | null;
  majors_to_consider_switching_to: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipProfile extends BookmarkedEntity {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  status: string;
  demographic_requirements?: string[] | null;
  citizenship_requirements?: string[] | null;
  application_url?: string | null;
  required_documents?: string[] | null;
  application_process?: string | null;
  category?: string[] | null;
  award_frequency?: string | null;
  tags?: string[] | null;
  eligibility_criteria?: Record<string, any>;
  academic_requirements?: Record<string, any>;
  application_open_date?: string | null;
  deadline?: string | null;
  amount?: number | null;
  renewable?: boolean | null;
  contact_information?: Record<string, any>;
  featured?: boolean | null;
  views_count?: number | null;
  total_applicants?: number | null;
  source_verified?: boolean | null;
}

export interface RealtimeBookmarkUpdate {
  contentType: BookmarkType;
  contentId: string;
  action: 'add' | 'delete';
}
