export interface Major {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  learning_objectives: string[] | null;
  common_courses: string[] | null;
  interdisciplinary_connections: string[] | null;
  job_prospects: string | null;
  certifications_to_consider: string[] | null;
  degree_levels: string[] | null;
  affiliated_programs: string[] | null;
  gpa_expectations: number | null;
  transferable_skills: string[] | null;
  tools_knowledge: string[] | null;
  tuition_and_fees: string | null;
  potential_salary: string | null;
  passion_for_subject: string | null;
  skill_match: string[] | null;
  professional_associations: string[] | null;
  global_applicability: string | null;
  common_difficulties: string[] | null;
  career_opportunities: string[] | null;
  intensity: string | null;
  stress_level: string | null;
  dropout_rates: string | null;
  majors_to_consider_switching_to: string[] | null;
  image_url?: string | null;
  field_of_study?: string | null;
  required_courses?: string[] | null;
  degree_level?: string | null;
  profiles_count?: number | null;
  relatedCareers?: string[] | null; // Added to fix MajorCard error
}