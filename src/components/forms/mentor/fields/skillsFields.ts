
import { FormFieldProps } from "@/components/forms/FormField";

export const skillsFields: FormFieldProps[] = [
  {
    name: "skills",
    label: "Skills",
    type: "textarea",
    placeholder: "Enter your skills separated by commas (e.g., React, TypeScript, Node.js)",
    required: true
  },
  {
    name: "tools_used",
    label: "Tools & Technologies",
    type: "textarea",
    placeholder: "Enter tools and technologies separated by commas (e.g., VS Code, Git, Docker)",
    required: true
  },
  {
    name: "keywords",
    label: "Keywords",
    type: "textarea",
    placeholder: "Enter keywords that describe your expertise separated by commas (e.g., web development, backend, frontend)",
    required: true
  },
  {
    name: "fields_of_interest",
    label: "Fields of Interest",
    type: "textarea",
    placeholder: "Enter your fields of interest separated by commas (e.g., AI, Machine Learning, Web Development)",
    required: true
  }
];
