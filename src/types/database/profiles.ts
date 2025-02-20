
import type { School } from "./schools";
import type { SchoolType } from "./schools";

export interface Profile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  user_type: 'mentee' | 'mentor' | 'admin';
  highest_degree: 'No Degree' | 'High School' | 'Associate' | 'Bachelor' | 'Master' | 'MD' | 'PhD';
  skills: string[];
  tools_used: string[];
  keywords: string[];
  fields_of_interest: string[];
  years_of_experience: number;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  school_id?: string;
  company_id?: string;
  academic_major_id?: string;
  position?: string;
  onboarding_status: 'Pending' | 'Completed';
  total_booked_sessions: number;
  top_mentor: boolean;
  created_at: string;
  updated_at: string;
  school?: School;
}

export interface ProfileWithDetails extends Profile {
  company_name?: string | null;
  school_name?: string | null;
  academic_major?: string | null;
  career_title?: string | null;
}
