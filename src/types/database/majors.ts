
export interface Major {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  featured: boolean;
  status: 'Pending' | 'Approved' | 'Rejected';
  author_id?: string;
  token_cost: number;
  profiles_count: number;
  gpa_expectations?: number;
  stress_level?: string;
  dropout_rates?: string;
  category?: string[];
  intensity?: string;
  career_opportunities?: string[];
  majors_to_consider_switching_to?: string[];
  common_difficulties?: string[];
  global_applicability?: string;
  professional_associations?: string[];
  skill_match?: string[];
  passion_for_subject?: string;
  potential_salary?: string;
  tools_knowledge?: string[];
  transferable_skills?: string[];
  affiliated_programs?: string[];
  degree_levels?: string[];
  certifications_to_consider?: string[];
  job_prospects?: string;
  interdisciplinary_connections?: string[];
  common_courses?: string[];
  learning_objectives?: string[];
  career_major_relations?: any[];
}
