import type { School } from './schools';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string;
  created_at: string;
  updated_at: string;
  top_mentor: boolean;
  skills: string[] | null;
  tools_used: string[] | null;
  keywords: string[] | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  years_of_experience: number;
  location: string | null;
  fields_of_interest: string[] | null;
  school_id: string | null;
  company_id: string | null;
  academic_major_id: string | null;
  first_name: string | null;
  last_name: string | null;
  user_type: 'mentee' | 'mentor' | 'admin';
  highest_degree: 'No Degree' | 'Associate' | 'Bachelor' | 'Master' | 'PhD';
  total_booked_sessions: number;
  position: string | null;
  X_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  youtube_url: string | null;
  instagram_url: string | null;
  languages: string[] | null;
  company_name?: string | null;
  school_name?: string | null;
  academic_major?: string | null;
  career?: {
    title: string;
    id: string;
  } | null;
  school?: School;
}

export interface PersonalSectionProps {
  register: any;
  handleFieldChange: (fieldName: string, value: any) => void;
  schoolId: string;
}