import { FormField, FormFieldProps } from "@/components/forms/FormField";
import { Control } from "react-hook-form";
import { CareerFormValues } from "@/lib/validations/blog";

interface CareerDetailsProps {
  control: Control<CareerFormValues>;
}

export function CareerDetails({ control }: CareerDetailsProps) {
  const fields: FormFieldProps[] = [
    {
      name: "job_outlook",
      label: "Job Outlook",
      type: "textarea",
      placeholder: "Describe the job outlook"
    },
    {
      name: "industry",
      label: "Industry",
      type: "text",
      placeholder: "e.g., Technology, Healthcare"
    },
    {
      name: "work_environment",
      label: "Work Environment",
      type: "textarea",
      placeholder: "Describe the work environment"
    },
    {
      name: "growth_potential",
      label: "Growth Potential",
      type: "textarea",
      placeholder: "Describe career growth potential"
    },
    {
      name: "stress_levels",
      label: "Stress Levels",
      type: "text",
      placeholder: "Describe typical stress levels"
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