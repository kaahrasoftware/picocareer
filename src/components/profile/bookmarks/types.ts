
export type BookmarkType = 
  | 'career' 
  | 'major' 
  | 'mentor' 
  | 'scholarship' 
  | 'opportunity';

export interface BookmarkedEntity {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

export interface CareerProfile {
  id: string;
  title: string;
  description?: string;
  salary_range?: string;
  job_growth?: string;
  work_environment?: string;
  skills_required?: string[];
}

export interface MajorProfile {
  id: string;
  title: string;
  description?: string;
  degree_levels?: string[];
  career_opportunities?: string[];
  common_courses?: string[];
}

export interface MentorProfile {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  bio?: string;
  position?: string;
  company_name?: string;
  years_of_experience?: number;
  skills?: string[];
}
