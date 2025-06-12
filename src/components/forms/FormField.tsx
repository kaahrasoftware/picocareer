
import React from "react";
import { FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "./ImageUpload";

interface BaseFieldProps {
  name: string;
  field?: any;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

interface TextFieldProps extends BaseFieldProps {
  type: "text" | "email" | "password" | "number" | "url";
}

interface TextareaFieldProps extends BaseFieldProps {
  type: "textarea";
  rows?: number;
}

interface SelectFieldProps extends BaseFieldProps {
  type: "select";
  options: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface DynamicSelectFieldProps extends BaseFieldProps {
  type: "dynamic-select";
  tableName: string;
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
}

interface ImageFieldProps extends BaseFieldProps {
  type: "image";
  bucket: string;
  accept?: string;
  folderPath?: string;
}

interface CheckboxFieldProps extends BaseFieldProps {
  type: "checkbox";
}

interface SwitchFieldProps extends BaseFieldProps {
  type: "switch";
}

interface RichTextFieldProps extends BaseFieldProps {
  type: "richtext";
  component?: any;
  bucket?: string;
}

interface CategoryFieldProps extends BaseFieldProps {
  type: "category";
  options?: Array<{ value: string; label: string }>;
}

interface SubcategoryFieldProps extends BaseFieldProps {
  type: "subcategory";
  options?: Array<{ value: string; label: string }>;
}

interface ArrayFieldProps extends BaseFieldProps {
  type: "array";
  itemType?: "text" | "textarea";
}

export type FormFieldProps = 
  | TextFieldProps 
  | TextareaFieldProps 
  | SelectFieldProps 
  | DynamicSelectFieldProps
  | ImageFieldProps
  | CheckboxFieldProps 
  | SwitchFieldProps
  | RichTextFieldProps
  | CategoryFieldProps
  | SubcategoryFieldProps
  | ArrayFieldProps;

export function FormField(props: FormFieldProps) {
  const { field, label, description, required, placeholder, disabled } = props;

  if (!field) {
    return null;
  }

  const renderField = () => {
    switch (props.type) {
      case "text":
      case "email":
      case "password":
      case "number":
      case "url":
        return (
          <Input
            type={props.type}
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value || ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            rows={props.rows || 3}
            {...field}
            value={field.value || ""}
          />
        );

      case "array":
        return (
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            rows={3}
            {...field}
            value={field.value || ""}
          />
        );

      case "select":
        return (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "dynamic-select":
        return (
          <Select
            value={field.value || ""}
            onValueChange={field.onChange}
            disabled={disabled}
          >
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {props.options?.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "image":
        return (
          <ImageUpload
            control={undefined}
            name={props.name}
            label=""
            bucket={props.bucket}
            accept={props.accept}
            folderPath={props.folderPath}
            onUploadSuccess={(url) => field.onChange(url)}
          />
        );

      case "checkbox":
        return (
          <Checkbox
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        );

      case "switch":
        return (
          <Switch
            checked={field.value || false}
            onCheckedChange={field.onChange}
            disabled={disabled}
          />
        );

      case "richtext":
      case "category":
      case "subcategory":
        return (
          <Input
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            {...field}
            value={field.value || ""}
          />
        );

      default:
        return null;
    }
  };

  if (props.type === "checkbox" || props.type === "switch") {
    return (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>{renderField()}</FormControl>
        <FormMessage />
      </FormItem>
    );
  }

  return (
    <FormItem>
      <FormLabel>
        {label} {required && <span className="text-red-500">*</span>}
      </FormLabel>
      <FormControl>{renderField()}</FormControl>
      {description && <FormDescription>{description}</FormDescription>}
      <FormMessage />
    </FormItem>
  );
}
