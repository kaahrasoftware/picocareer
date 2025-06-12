
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";
import { skillsFields } from "../fields/skillsFields";

interface SkillsSectionProps {
  control: Control<FormValues>;
}

export function SkillsSection({ control }: SkillsSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Skills & Expertise</h2>
      <div className="space-y-6">
        {skillsFields.map((fieldConfig) => (
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
