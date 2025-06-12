
import { z } from "zod";

export const mentorRegistrationSchema = z.object({
  // Personal Information
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().optional(), // Only required for new users
  avatar_url: z.string().optional(), // Make avatar optional for now
  
  // Professional Information
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  years_of_experience: z.string().transform((val) => parseInt(val) || 0).pipe(z.number().min(0, "Years of experience must be 0 or greater")),
  position: z.string().min(1, "Position is required"),
  company_id: z.string().min(1, "Company is required"),
  location: z.string().min(1, "Location is required"),
  languages: z.string().optional(),
  
  // Education
  school_id: z.string().min(1, "School is required"),
  academic_major_id: z.string().min(1, "Academic major is required"),
  
  // Skills
  skills: z.string().min(1, "Skills are required"),
  tools_used: z.string().min(1, "Tools used are required"),
  keywords: z.string().min(1, "Keywords are required"),
  fields_of_interest: z.string().min(1, "Fields of interest are required"),
  
  // Social Links (all optional)
  linkedin_url: z.string().optional(),
  github_url: z.string().optional(),
  website_url: z.string().optional(),
  X_url: z.string().optional(),
  facebook_url: z.string().optional(),
  instagram_url: z.string().optional(),
  tiktok_url: z.string().optional(),
  youtube_url: z.string().optional(),
  
  // Consent
  background_check_consent: z.boolean().refine(val => val === true, {
    message: "You must consent to background check to register as a mentor"
  })
});
