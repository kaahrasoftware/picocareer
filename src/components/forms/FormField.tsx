import React, { useEffect, useState } from "react";
import {
  FormField as FormFieldBase,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { categories, subcategories } from "./blog/BlogFormFields";

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree" | "multiselect" | "select";
  bucket?: string;
  required?: boolean;
  options?: Array<{ id: string; title?: string; name?: string }>;
  dependsOn?: string;
  watch?: any;
  control?: any;
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
  required = false,
  options = [],
  dependsOn,
  watch
}: FormFieldProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [availableOptions, setAvailableOptions] = useState<string[]>([...options]);
  
  const watchDependency = dependsOn ? watch?.(dependsOn) : null;
  
  useEffect(() => {
    if (dependsOn === 'categories' && watchDependency) {
      const newOptions = watchDependency.flatMap((category: string) => 
        subcategories[category] || []
      );
      setAvailableOptions(Array.from(new Set(newOptions)));
    }
  }, [dependsOn, watchDependency]);

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
            {type === "select" ? (
              <Select
                value={field.value || ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title || option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "multiselect" ? (
              <Select
                value={field.value?.[field.value.length - 1] || ""}
                onValueChange={(value) => {
                  const newValues = field.value || [];
                  if (!newValues.includes(value)) {
                    field.onChange([...newValues, value]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {availableOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : type === "degree" ? (
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
            ) : type === "textarea" && name === "content" ? (
              <RichTextEditor
                value={field.value || ''}
                onChange={field.onChange}
                placeholder={placeholder}
              />
            ) : type === "textarea" ? (
              <Input
                {...field}
                placeholder={placeholder}
                className="min-h-[100px]"
              />
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
          {type === "multiselect" && field.value?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {field.value.map((value: string) => (
                <span
                  key={value}
                  className="bg-primary/10 text-sm px-2 py-1 rounded-full flex items-center gap-1"
                >
                  {value}
                  <button
                    type="button"
                    onClick={() => {
                      field.onChange(field.value.filter((v: string) => v !== value));
                    }}
                    className="text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </FormItem>
      )}
    />
  );
}
