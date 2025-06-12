
import { FormFieldProps } from "@/components/forms/FormField";

export const educationFields: FormFieldProps[] = [
  {
    name: "school_id",
    label: "School",
    type: "dynamic-select",
    placeholder: "Select your school",
    tableName: "schools",
    required: true
  },
  {
    name: "academic_major_id",
    label: "Academic Major",
    type: "dynamic-select",
    placeholder: "Select your major",
    tableName: "majors",
    required: true
  }
];
