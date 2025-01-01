import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";

interface EducationSectionProps {
  control: Control<FormValues>;
  fields: any[];
  schools?: any[];
  majors?: any[];
}

export function EducationSection({ control, fields, schools = [], majors = [] }: EducationSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Education</h2>
      <div className="space-y-6">
        {fields.map((field) => {
          let options = [];
          if (field.name === "school_id") options = schools;
          else if (field.name === "academic_major_id") options = majors;

          return (
            <FormField
              key={field.name}
              control={control}
              {...field}
              options={options}
            />
          );
        })}
      </div>
    </Card>
  );
}