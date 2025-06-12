
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";
import { educationFields } from "../fields/educationFields";

interface EducationSectionProps {
  control: Control<FormValues>;
  schools?: any[];
  majors?: any[];
}

export function EducationSection({ control, schools = [], majors = [] }: EducationSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Education</h2>
      <div className="space-y-6">
        {educationFields.map((field) => {
          let options = [];
          if (field.name === "school_id") {
            options = schools.map(school => ({ value: school.id, label: school.name }));
          } else if (field.name === "academic_major_id") {
            options = majors.map(major => ({ value: major.id, label: major.title }));
          }

          return (
            <Controller
              key={field.name}
              control={control}
              name={field.name as keyof FormValues}
              render={({ field: controllerField }) => (
                <FormField
                  field={controllerField}
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  description={field.description}
                  required={field.required}
                  {...(field.type === "select" && { options })}
                />
              )}
            />
          );
        })}
      </div>
    </Card>
  );
}
