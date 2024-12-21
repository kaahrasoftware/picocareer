import React from "react";
import {
  FormField as FormFieldBase,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "./ImageUpload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormFieldProps {
  control: any;
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree";
  bucket?: string;
  required?: boolean;
}

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

export function FormField({ 
  control, 
  name, 
  label, 
  placeholder, 
  description, 
  type = "text",
  bucket = "images",
  required = false
}: FormFieldProps) {
  if (type === "image") {
    return (
      <ImageUpload
        control={control}
        name={name}
        label={label}
        description={description}
        bucket={bucket}
      />
    );
  }

  return (
    <FormFieldBase
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            {type === "degree" ? (
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder || "Select a degree"} />
                </SelectTrigger>
                <SelectContent>
                  {degreeOptions.map((degree) => (
                    <SelectItem key={degree} value={degree}>
                      {degree}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "textarea" ? (
              <Textarea {...field} placeholder={placeholder} />
            ) : type === "checkbox" ? (
              <div className="flex flex-row items-start space-x-3 space-y-0">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </div>
            ) : type === "number" ? (
              <Input
                {...field}
                type="number"
                onChange={e => field.onChange(parseFloat(e.target.value))}
                placeholder={placeholder}
              />
            ) : type === "array" ? (
              <Input {...field} placeholder={`${placeholder} (comma-separated)`} />
            ) : (
              <Input {...field} placeholder={placeholder} />
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}