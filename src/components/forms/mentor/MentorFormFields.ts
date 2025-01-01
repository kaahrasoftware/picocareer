import { z } from "zod";
import { FormFieldProps } from "@/components/forms/FormField";

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
  linkedin_url: z.string().url("Invalid LinkedIn URL"),
  github_url: z.string().url("Invalid GitHub URL").optional(),
  website_url: z.string().url("Invalid website URL").optional(),
  X_url: z.string().url("Invalid X URL").optional(),
  facebook_url: z.string().url("Invalid Facebook URL").optional(),
  instagram_url: z.string().url("Invalid Instagram URL").optional(),
  tiktok_url: z.string().url("Invalid TikTok URL").optional(),
  youtube_url: z.string().url("Invalid YouTube URL").optional(),
  languages: z.string().optional(),
  background_check_consent: z.boolean().refine((val) => val === true, {
    message: "You must consent to the background check to register as a mentor"
  })
});

export const mentorFormFields: FormFieldProps[] = [
  {
    name: "first_name",
    label: "First Name",
    type: "text",
    placeholder: "Enter your first name",
    required: true
  },
  {
    name: "last_name",
    label: "Last Name",
    type: "text",
    placeholder: "Enter your last name",
    required: true
  },
  {
    name: "email",
    label: "Email",
    type: "text",
    placeholder: "Enter your email address",
    required: true
  },
  {
    name: "avatar_url",
    label: "Profile Picture",
    type: "image",
    bucket: "avatars",
    description: "Upload a professional profile picture",
    required: true
  },
  {
    name: "bio",
    label: "Professional Bio",
    type: "textarea",
    placeholder: "Tell us about your professional journey and expertise",
    required: true
  },
  {
    name: "years_of_experience",
    label: "Years of Experience",
    type: "number",
    placeholder: "Enter your years of experience",
    required: true
  },
  {
    name: "position",
    label: "Current Position",
    type: "select",
    placeholder: "Select your current position",
    required: true
  },
  {
    name: "company_id",
    label: "Company",
    type: "select",
    placeholder: "Select your company",
    required: true
  },
  {
    name: "school_id",
    label: "School",
    type: "select",
    placeholder: "Select your school",
    required: true
  },
  {
    name: "academic_major_id",
    label: "Academic Major",
    type: "select",
    placeholder: "Select your major",
    required: true
  },
  {
    name: "highest_degree",
    label: "Highest Degree",
    type: "degree",
    required: true
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "City, Country",
    required: true
  },
  {
    name: "languages",
    label: "Languages",
    type: "array",
    placeholder: "Enter languages you speak (comma-separated)",
    description: "List all languages you're comfortable mentoring in"
  },
  {
    name: "skills",
    label: "Skills",
    type: "array",
    placeholder: "Enter your skills (comma-separated)",
    required: true
  },
  {
    name: "tools_used",
    label: "Tools & Technologies",
    type: "array",
    placeholder: "Enter tools and technologies you use (comma-separated)",
    required: true
  },
  {
    name: "keywords",
    label: "Keywords",
    type: "array",
    placeholder: "Enter keywords that describe your expertise (comma-separated)",
    required: true
  },
  {
    name: "fields_of_interest",
    label: "Fields of Interest",
    type: "array",
    placeholder: "Enter your fields of interest (comma-separated)",
    required: true
  },
  {
    name: "linkedin_url",
    label: "LinkedIn Profile",
    type: "text",
    placeholder: "https://linkedin.com/in/username",
    required: true
  },
  {
    name: "github_url",
    label: "GitHub Profile",
    type: "text",
    placeholder: "https://github.com/username"
  },
  {
    name: "website_url",
    label: "Personal Website",
    type: "text",
    placeholder: "https://yourwebsite.com"
  },
  {
    name: "X_url",
    label: "X (Twitter) Profile",
    type: "text",
    placeholder: "https://x.com/username"
  },
  {
    name: "facebook_url",
    label: "Facebook Profile",
    type: "text",
    placeholder: "https://facebook.com/username"
  },
  {
    name: "instagram_url",
    label: "Instagram Profile",
    type: "text",
    placeholder: "https://instagram.com/username"
  },
  {
    name: "tiktok_url",
    label: "TikTok Profile",
    type: "text",
    placeholder: "https://tiktok.com/@username"
  },
  {
    name: "youtube_url",
    label: "YouTube Channel",
    type: "text",
    placeholder: "https://youtube.com/@username"
  }
];