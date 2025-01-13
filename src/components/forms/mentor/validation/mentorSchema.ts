import { z } from "zod";

export const mentorRegistrationSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  avatar_url: z.string().min(1, "Profile picture is required"),
  bio: z.string().min(50, "Bio should be at least 50 characters long"),
  years_of_experience: z.number().min(0, "Years of experience must be a positive number"),
  position: z.string().min(1, "Current position is required"),
  company_id: z.string().min(1, "Company is required"),
  school_id: z.string().min(1, "School is required"),
  academic_major_id: z.string().min(1, "Academic major is required"),
  highest_degree: z.string().min(1, "Highest degree is required"),
  location: z.string().min(1, "Location is required"),
  skills: z.string().min(1, "Skills are required"),
  tools_used: z.string().min(1, "Tools and technologies are required"),
  keywords: z.string().min(1, "Keywords are required"),
  fields_of_interest: z.string().min(1, "Fields of interest are required"),
  linkedin_url: z.string().url("Invalid LinkedIn URL").optional().nullable().or(z.literal('')),
  github_url: z.string().url("Invalid GitHub URL").optional().nullable().or(z.literal('')),
  website_url: z.string().url("Invalid website URL").optional().nullable().or(z.literal('')),
  X_url: z.string().url("Invalid X URL").optional().nullable().or(z.literal('')),
  facebook_url: z.string().url("Invalid Facebook URL").optional().nullable().or(z.literal('')),
  instagram_url: z.string().url("Invalid Instagram URL").optional().nullable().or(z.literal('')),
  tiktok_url: z.string().url("Invalid TikTok URL").optional().nullable().or(z.literal('')),
  youtube_url: z.string().url("Invalid YouTube URL").optional().nullable().or(z.literal('')),
  languages: z.string().optional(),
  background_check_consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to the background check to register as a mentor"
  })
});

export type FormValues = z.infer<typeof mentorRegistrationSchema>;