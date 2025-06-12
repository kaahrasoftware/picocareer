
export interface FormValues {
  // Personal Information
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  avatar_url?: string;
  
  // Professional Information
  bio: string;
  years_of_experience: string; // Changed from number to string to match schema transformation
  position: string;
  company_id: string;
  location: string;
  languages?: string;
  
  // Education
  school_id: string;
  academic_major_id: string;
  
  // Skills
  skills: string;
  tools_used: string;
  keywords: string;
  fields_of_interest: string;
  
  // Social Links (all optional)
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  X_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  
  // Consent
  background_check_consent: boolean;
}
