
import React from "react";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/forms/ImageUpload";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { CategoryField } from "./fields/CategoryField";
import { SubcategoryField } from "./fields/SubcategoryField";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface FormFieldProps {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  bucket?: string;
  component?: React.ComponentType<any>;
  defaultValue?: any;
  dependsOn?: string;
  dependsOnValue?: string;
  dependsOnValues?: string[];
}

interface ComponentProps {
  control: Control<any>;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  bucket?: string;
  dependsOn?: string;
  dependsOnValue?: string;
  dependsOnValues?: string[];
  watch?: any;
}

export function FormField({
  control,
  name,
  label,
  type,
  placeholder,
  description,
  required,
  options,
  bucket,
  dependsOn,
  dependsOnValue,
  dependsOnValues,
  watch
}: ComponentProps) {
  // Check if this field should be shown based on dependency
  if (dependsOn && watch) {
    const dependsOnFieldValue = watch(dependsOn);
    
    // Check if field should be shown based on single value or array of values
    if (dependsOnValue && dependsOnFieldValue !== dependsOnValue) {
      return null;
    }
    
    if (dependsOnValues && !dependsOnValues.includes(dependsOnFieldValue)) {
      return null;
    }
  }

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}{required ? <span className="text-destructive ml-1">*</span> : null}</FormLabel>
          <FormControl>
            {renderFormControl(field, type, placeholder, options, bucket)}
          </FormControl>
          {description && (
            <FormDescription>{description}</FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function renderFormControl(field: any, type: string, placeholder?: string, options?: any[], bucket?: string) {
  switch (type) {
    case "text":
      return <Input {...field} placeholder={placeholder} />;
    case "textarea":
      return <Textarea {...field} placeholder={placeholder} />;
    case "select":
      return (
        <Select
          value={field.value}
          onValueChange={field.onChange}
        >
          <SelectTrigger>
            <SelectValue placeholder={placeholder || "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "image":
    case "file":
      return <ImageUpload 
        control={field.control} 
        name={field.name} 
        label={""} // Empty because we show the label above
        bucket={bucket || "uploads"} 
        accept={type === "image" ? "image/*" : undefined}
      />;
    case "category":
      return <CategoryField 
        control={field.control} 
        name={field.name} 
      />;
    case "subcategory":
      return <SubcategoryField 
        control={field.control} 
        name={field.name} 
        categoryField={field.dependsOn}
      />;
    default:
      return <Input {...field} placeholder={placeholder} />;
  }
}
