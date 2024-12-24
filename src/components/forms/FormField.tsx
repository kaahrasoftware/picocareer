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
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { SelectWithCustomOption } from "./fields/SelectWithCustomOption";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const degreeOptions = [
  "No Degree",
  "High School",
  "Associate",
  "Bachelor",
  "Master",
  "MD",
  "PhD"
] as const;

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
            {type === "select" ? (
              name === "position" ? (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={options}
                  placeholder={placeholder || "Select position"}
                  tableName="careers"
                />
              ) : name === "company_id" ? (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={options}
                  placeholder={placeholder || "Select company"}
                  tableName="companies"
                />
              ) : name === "school_id" ? (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={options}
                  placeholder={placeholder || "Select school"}
                  tableName="schools"
                />
              ) : name === "academic_major_id" ? (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={options}
                  placeholder={placeholder || "Select major"}
                  tableName="majors"
                />
              ) : (
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
              )
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
        </FormItem>
      )}
    />
  );
}