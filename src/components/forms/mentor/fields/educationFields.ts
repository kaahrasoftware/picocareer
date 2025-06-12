
import { FormFieldProps } from "@/components/forms/FormField";

export const educationFields: FormFieldProps[] = [
  {
    name: "school_id",
    label: "School",
    type: "dynamic-select",
    tableName: "schools",
    placeholder: "Select your school",
    required: true
  },
  {
    name: "academic_major_id",
    label: "Academic Major",
    type: "dynamic-select",
    tableName: "majors",
    placeholder: "Select your major",
    required: true
  }
];
