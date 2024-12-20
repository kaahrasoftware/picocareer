export interface Major {
  id: string;
  title: string;
  description: string | null;
  featured: boolean | null;
  learning_objectives: string[] | null;
  common_courses: string[] | null;
  required_skills: string[] | null;
  tools_used: string[] | null;
  career_opportunities: string[] | null;
  job_titles: string[] | null;
  salary_range: string | null;
  work_environment: string | null;
  growth_potential: string | null;
  degree_levels: string[] | null;
  prerequisites: string[] | null;
  duration: string | null;
  tuition_range: string | null;
  admission_requirements: string[] | null;
  scholarships_available: boolean | null;
  internship_opportunities: boolean | null;
  research_opportunities: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}