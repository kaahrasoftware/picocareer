
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";
import { professionalFields } from "../fields/professionalFields";

interface ProfessionalSectionProps {
  control: Control<FormValues>;
  careers?: any[];
  companies?: any[];
}

export function ProfessionalSection({ control, careers = [], companies = [] }: ProfessionalSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Professional Experience</h2>
      <div className="space-y-6">
        {professionalFields.map((fieldConfig) => {
          let options = [];
          if (fieldConfig.name === "position") {
            options = careers.map(career => ({ value: career.id, label: career.title }));
          } else if (fieldConfig.name === "company_id") {
            options = companies.map(company => ({ value: company.id, label: company.name }));
          }

          return (
            <Controller
              key={fieldConfig.name}
              control={control}
              name={fieldConfig.name as keyof FormValues}
              render={({ field }) => (
                <FormField
                  name={fieldConfig.name}
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
