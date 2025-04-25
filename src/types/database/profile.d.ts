
export interface Profile {
  id: string;
  email: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  bio?: string;
  location?: string;
  user_type?: 'admin' | 'mentor' | 'mentee';
  position?: string;
  company_id?: string;
  school_id?: string;
  academic_major_id?: string;
  highest_degree?: string;
  years_of_experience?: number;
  languages?: string[];
  skills?: string[];
  keywords?: string[];
  fields_of_interest?: string[];
  top_mentor?: boolean;
  created_at: string;
  updated_at: string;
  X_url?: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  instagram_url?: string;
  facebook_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  background_check_consent?: boolean;
  onboarding_status?: string;
  total_booked_sessions?: number;
  tools_used?: string[];
}
