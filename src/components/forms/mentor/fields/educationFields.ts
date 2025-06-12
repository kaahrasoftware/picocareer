
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
  },
  {
    name: "highest_degree",
    label: "Highest Degree",
    type: "select",
    required: true,
    options: [
      { value: "No Degree", label: "No Degree" },
      { value: "High School", label: "High School" },
      { value: "Associate", label: "Associate" },
      { value: "Bachelor", label: "Bachelor" },
      { value: "Master", label: "Master" },
      { value: "MD", label: "MD" },
      { value: "PhD", label: "PhD" }
    ]
  }
];
