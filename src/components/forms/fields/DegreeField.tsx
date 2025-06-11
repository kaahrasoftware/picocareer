
import React from "react";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { degreeOptions } from "@/constants/degrees";

interface DegreeFieldProps {
  field: any;
  label: string;
  description?: string;
  required?: boolean;
}

export function DegreeField({
  field,
  label,
  description,
  required
}: DegreeFieldProps) {
  return (
    <FormItem>
      <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
        {label}
      </FormLabel>
      <FormControl>
        <Select
          value={field.value || ""}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your highest degree" />
          </SelectTrigger>
          <SelectContent>
            {degreeOptions.map((degree) => (
              <SelectItem key={degree} value={degree}>
                {degree}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FormControl>
      {description && (
        <FormDescription>{description}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
}
