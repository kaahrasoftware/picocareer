import React from "react";
import { useController } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ImageUpload } from "./ImageUpload";
import { SelectFilter } from "../community/filters/SelectFilter";

interface FormFieldProps {
  name: string;
  label: string;
  control: any;
  type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree";
  placeholder?: string;
  description?: string;
  bucket?: string;
  required?: boolean;
  options?: string[];
}

export function FormField({ 
  name, 
  label, 
  control, 
  type = "text",
  placeholder,
  description,
  bucket,
  required,
  options = []
}: FormFieldProps) {
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required },
  });

  const renderField = () => {
    switch (type) {
      case "textarea":
        return (
          <Textarea
            {...field}
            placeholder={placeholder}
            className="min-h-[100px]"
          />
        );
      case "checkbox":
        return (
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        );
      case "array":
        return (
          <SelectFilter
            value={field.value}
            onValueChange={field.onChange}
            placeholder={placeholder || ""}
            options={options}
            multiple={true}
          />
        );
      case "image":
        if (!bucket) {
          console.error("Bucket is required for image upload");
          return null;
        }
        return (
          <ImageUpload
            name={name}
            label={label}
            description={description}
            bucket={bucket}
            control={control}
            onChange={field.onChange}
          />
        );
      default:
        return (
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderField()}
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
      {error && (
        <p className="text-sm text-red-500">{error.message}</p>
      )}
    </div>
  );
}