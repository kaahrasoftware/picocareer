import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";

interface SocialSectionProps {
  control: Control<FormValues>;
  fields: any[];
}

export function SocialSection({ control, fields }: SocialSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Social Links</h2>
      <div className="grid gap-6 sm:grid-cols-2">
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