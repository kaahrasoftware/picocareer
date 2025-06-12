
import { z } from "zod";
import { mentorRegistrationSchema } from "./validation/mentorSchema";

export type FormValues = z.infer<typeof mentorRegistrationSchema>;

export interface MentorFormData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  avatar_url: string;
  bio: string;
  years_of_experience: number;
  position: string;
  company_id: string;
  school_id: string;
  academic_major_id: string;
  location: string;
  languages?: string;
  skills: string;
  tools_used: string;
  keywords: string;
  fields_of_interest: string;
  linkedin_url?: string;
  github_url?: string;
  website_url?: string;
  X_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  background_check_consent: boolean;
}
