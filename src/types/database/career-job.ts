export interface CareerJob {
  job_outlook: string | null;
  industry: string | null;
  work_environment: string | null;
  growth_potential: string | null;
  careers_to_consider_switching_to: string[] | null;
  required_education: string[] | null;
  stress_levels: string | null;
  rare: boolean | null;
  popular: boolean | null;
  new_career: boolean | null;
  profiles_count: number | null;
  important_note: string | null;
}