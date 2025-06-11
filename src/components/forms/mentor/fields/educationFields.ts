
import { FormFieldProps } from "@/components/forms/FormField";

export const educationFields: FormFieldProps[] = [
  {
    name: "school_id",
    label: "School",
    type: "select-with-custom",
    placeholder: "Select your school",
    tableName: "schools",
    required: true
  },
  {
    name: "academic_major_id",
    label: "Academic Major",
    type: "select-with-custom",
    placeholder: "Select your major",
    tableName: "majors",
    required: true
  },
  {
    name: "highest_degree",
    label: "Highest Degree",
    type: "degree",
    required: true
  }
];
