export interface Profile {
  id: string;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  user_type: string | null;
  email: string;
  created_at: string;
  updated_at: string;
  school_id: string | null;
  company_id: string | null;
  position: string | null;
  highest_degree: string | null;
  academic_major_id: string | null;
  skills: string[] | null;
  tools_used: string[] | null;
  keywords: string[] | null;
  bio: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  years_of_experience: number | null;
  location: string | null;
  fields_of_interest: string[] | null;
  career_id: string | null;
  // Include joined fields as optional
  company_name?: string | null;
  school_name?: string | null;
  academic_major: string | null; // Changed from optional to required
  top_mentor?: boolean | null;
}