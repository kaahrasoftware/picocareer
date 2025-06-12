
import { Controller } from "react-hook-form";
import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormValues } from "../types";
import { socialFields } from "../fields/socialFields";

interface SocialSectionProps {
  control: Control<FormValues>;
}

export function SocialSection({ control }: SocialSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Social Links</h2>
      <p className="text-muted-foreground mb-4">
        While social links are optional, we highly recommend adding them to enhance your mentor profile and build trust with potential mentees.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {socialFields.map((fieldConfig) => (
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
