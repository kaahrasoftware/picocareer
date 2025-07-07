
import type { Profile } from "@/types/database/profiles";

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
  X_url: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
  tiktok_url: string;
  position: string;
  company_id: string;
  school_id: string;
  academic_major_id: string;
  highest_degree: string;
  student_nonstudent: string;
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

export interface ProfileEditFormProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
  onClose?: () => void; // Made optional
  onCancel?: () => void;
  onSuccess?: () => void;
}
