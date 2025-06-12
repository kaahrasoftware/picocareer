
import { FormFieldProps } from "@/components/forms/FormField";
import { degreeOptions } from "@/constants/degrees";

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
    placeholder: "Select your highest degree",
    required: true,
    options: degreeOptions.map(degree => ({
      value: degree,
      label: degree
    }))
  }
];
