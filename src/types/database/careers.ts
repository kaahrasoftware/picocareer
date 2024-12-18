import { CareerBase } from './career-base';
import { CareerEducation } from './career-education';
import { CareerSkills } from './career-skills';
import { CareerJob } from './career-job';
import { CareerPersonal } from './career-personal';

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
  growth_potential: string | null;
  keywords: string[] | null;
  transferable_skills: string[] | null;
  stress_levels: number | null;
  careers_to_consider_switching_to: string[] | null;
}