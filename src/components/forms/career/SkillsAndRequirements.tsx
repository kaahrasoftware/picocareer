import { FormField, FormFieldProps } from "@/components/forms/FormField";
import { Control } from "react-hook-form";
import { CareerFormValues } from "@/lib/validations/blog";

interface SkillsAndRequirementsProps {
  control: Control<CareerFormValues>;
}

export function SkillsAndRequirements({ control }: SkillsAndRequirementsProps) {
  const fields: FormFieldProps[] = [
    {
      name: "academic_majors",
      label: "Academic Majors",
      type: "array",
      placeholder: "List relevant academic majors (comma-separated)"
    },
    {
      name: "required_skills",
      label: "Required Skills",
      type: "array",
      placeholder: "List required skills (comma-separated)"
    },
    {
      name: "required_tools",
      label: "Required Tools",
      type: "array",
      placeholder: "List required tools (comma-separated)"
    },
    {
      name: "required_education",
      label: "Required Education",
      type: "array",
      placeholder: "List required education levels (comma-separated)"
    }
  ];

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <FormField
          key={field.name}
          control={control}
          {...field}
        />
      ))}
    </div>
  );
}