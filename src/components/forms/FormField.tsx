import { TextInputField } from "./fields/TextInputField";
import { TextareaField } from "./fields/TextareaField";
import { MultiSelectField } from "./fields/MultiSelectField";
import { ImageUpload } from "./ImageUpload";
import { SelectWithCustomOption } from "./fields/SelectWithCustomOption";
import { categories } from "./blog/categories";
import { subcategories } from "./blog/subcategories";

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree" | "multiselect" | "select" | "categories" | "subcategories";
  bucket?: string;
  required?: boolean;
  options?: Array<{ id: string; title?: string; name?: string; }>;
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
  options = [], // Provide default empty array
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

  if (type === "textarea") {
    return (
      <TextareaField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        description={description}
        required={required}
        useRichText={name === "content"}
      />
    );
  }

  if (type === "categories") {
    return (
      <MultiSelectField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        description={description}
        required={required}
        options={categories}
      />
    );
  }

  if (type === "subcategories") {
    const selectedCategories = watch?.("categories") || [];
    const availableSubcategories = selectedCategories.reduce((acc: string[], category: string) => {
      return [...acc, ...(subcategories[category] || [])];
    }, []);

    return (
      <MultiSelectField
        control={control}
        name={name}
        label={label}
        placeholder={placeholder}
        description={description}
        required={required}
        options={availableSubcategories}
      />
    );
  }

  if (type === "select") {
    return (
      <SelectWithCustomOption
        value={watch?.(name) || ""}
        onValueChange={(value) => control?.setValue(name, value)}
        options={options}
        placeholder={placeholder || `Select ${label.toLowerCase()}`}
        tableName={name === "position" ? "careers" : 
                  name === "company_id" ? "companies" :
                  name === "school_id" ? "schools" :
                  name === "academic_major_id" ? "majors" : "majors"}
      />
    );
  }

  return (
    <TextInputField
      control={control}
      name={name}
      label={label}
      placeholder={placeholder}
      description={description}
      required={required}
      type={type === "number" ? "number" : "text"}
    />
  );
}