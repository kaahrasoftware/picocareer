export interface Career {
  id: string;
  title: string;
  description: string | null;
  industry: string | null;
  salary_range: string | null;
  average_salary: number | null;
  potential_salary: number | null;
  tuition_and_fees: number | null;
  intensity: number | null;
  stress_levels: number | null;
  dropout_rates: number | null;
  required_education: string[] | null;
  degree_levels: string[] | null;
  learning_objectives: string[] | null;
  common_courses: string[] | null;
  required_skills: string[] | null;
  required_tools: string[] | null;
  tools_knowledge: string[] | null;
  transferable_skills: string[] | null;
  skill_match: string[] | null;
  professional_associations: string[] | null;
  common_difficulties: string[] | null;
  certifications_to_consider: string[] | null;
  affiliated_programs: string[] | null;
  majors_to_consider_switching_to: string[] | null;
  job_prospects: string | null;
  work_environment: string | null;
  growth_potential: string | null;
  passion_for_subject: string | null;
  global_applicability: string | null;
  image_url: string | null;
  featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface CareerWithMajors extends Career {
  career_major_relations: {
    major: {
      title: string;
    };
  }[];
}