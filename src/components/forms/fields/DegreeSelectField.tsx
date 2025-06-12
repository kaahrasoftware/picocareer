
import React from "react";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { degreeOptions } from "@/constants/degrees";

interface DegreeSelectFieldProps {
  field: any;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
}

export function DegreeSelectField({
  field,
  label,
  description,
  required,
  placeholder = "Select your highest degree"
}: DegreeSelectFieldProps) {
  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <FormControl>
        <Select
          value={field.value || ""}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder} />
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
