import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";

interface SkillsSectionProps {
  control: Control<FormValues>;
  fields: any[];
}

export function SkillsSection({ control, fields }: SkillsSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Skills & Expertise</h2>
      <div className="space-y-6">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={control}
            {...field}
          />
        ))}
      </div>
    </Card>
  );
}