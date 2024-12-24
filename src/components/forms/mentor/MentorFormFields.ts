import { FormFieldProps } from "@/components/forms/FormField";

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
    type: "text",
    placeholder: "Select your current position",
    required: true
  },
  {
    name: "company_id",
    label: "Company",
    type: "text",
    placeholder: "Select your company",
    required: true
  },
  {
    name: "school_id",
    label: "School",
    type: "text",
    placeholder: "Select your school",
    required: true
  },
  {
    name: "academic_major_id",
    label: "Academic Major",
    type: "text",
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
  }
];