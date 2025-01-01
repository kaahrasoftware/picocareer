import { FormFieldProps } from "@/components/forms/FormField";

export const educationFields: FormFieldProps[] = [
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
  }
];