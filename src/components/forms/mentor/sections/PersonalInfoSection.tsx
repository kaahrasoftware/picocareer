
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";
import { personalFields } from "../fields/personalFields";

interface PersonalInfoSectionProps {
  control: Control<FormValues>;
}

export function PersonalInfoSection({ control }: PersonalInfoSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {personalFields.map((fieldConfig) => (
          <Controller
            key={fieldConfig.name}
            control={control}
            name={fieldConfig.name as keyof FormValues}
            render={({ field }) => (
              <FormField
                name={fieldConfig.name}
                {...fieldConfig}
                field={field}
              />
            )}
          />
        ))}
      </div>
    </Card>
  );
}
