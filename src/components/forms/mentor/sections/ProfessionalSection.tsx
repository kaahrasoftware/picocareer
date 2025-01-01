import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";

interface ProfessionalSectionProps {
  control: Control<FormValues>;
  fields: any[];
  careers?: any[];
  companies?: any[];
}

export function ProfessionalSection({ control, fields, careers = [], companies = [] }: ProfessionalSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Professional Experience</h2>
      <div className="space-y-6">
        {fields.map((field) => {
          let options = [];
          if (field.name === "position") options = careers;
          else if (field.name === "company_id") options = companies;

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