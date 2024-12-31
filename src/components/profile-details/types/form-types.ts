import type { Profile } from "@/types/database/profiles";

export type Degree = "No Degree" | "High School" | "Associate" | "Bachelor" | "Master" | "MD" | "PhD";

export type FormFields = {
  first_name: string;
  last_name: string;
  bio: string;
  years_of_experience: number;
  location: string;
  skills: string;
  tools_used: string;
  keywords: string;
  fields_of_interest: string;
  linkedin_url: string;
  github_url: string;
  website_url: string;
  position: string;
  company_id: string;
  school_id: string;
  academic_major_id: string;
  highest_degree: Degree;
};

export interface ProfileFormProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  onCancel: () => void;
  onSuccess: () => void;
}