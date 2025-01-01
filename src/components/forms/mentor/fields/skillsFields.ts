import { FormFieldProps } from "@/components/forms/FormField";

export const skillsFields: FormFieldProps[] = [
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
  }
];