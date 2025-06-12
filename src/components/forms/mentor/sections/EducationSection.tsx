
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
        {educationFields.map((fieldConfig) => {
          let options = [];
          if (fieldConfig.name === "school_id") {
            options = schools.map(school => ({ value: school.id, label: school.name }));
          } else if (fieldConfig.name === "academic_major_id") {
            options = majors.map(major => ({ value: major.id, label: major.title }));
          }

          return (
            <Controller
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name as keyof FormValues}
              render={({ field }) => (
                <FormField
                  {...fieldConfig}
                  field={field}
                  {...(fieldConfig.type === "dynamic-select" && { options })}
                />
              )}
            />
          );
        })}
      </div>
    </Card>
  );
}
