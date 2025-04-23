
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
  tools_used?: string[];
  fields_of_interest?: string[];
  keywords?: string[];
  created_at: string;
  updated_at: string;
  top_mentor?: boolean;
  total_booked_sessions?: number;
  onboarding_status?: string;
  background_check_consent?: boolean;
}

export interface ExtendedProfile extends Profile {
  company_name?: string;
  school_name?: string;
  academic_major?: string;
  career_title?: string;
}
