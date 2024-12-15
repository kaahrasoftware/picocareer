export interface Career {
  id: string;
  title: string;
  description: string;
  salary_range: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  featured: boolean | null;
  required_education: string[] | null;
  required_skills: string[] | null;
  required_tools: string[] | null;
  job_outlook: string | null;
  industry: string | null;
  work_environment: string | null;
  average_salary: number | null;
  growth_potential: string | null;
  keywords: string[] | null;
}