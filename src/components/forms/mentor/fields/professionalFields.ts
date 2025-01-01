import { FormFieldProps } from "@/components/forms/FormField";

export const professionalFields: FormFieldProps[] = [
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
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "City, Country",
    required: true
  },
  {
    name: "languages",
    label: "Languages",
    type: "text",
    placeholder: "Enter languages you speak (comma-separated)",
    description: "List all languages you're comfortable mentoring in"
  }
];