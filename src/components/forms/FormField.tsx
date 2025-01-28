import React from "react";
import { FormField as FormFieldBase } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "./ImageUpload";
import { RichTextEditor } from "./RichTextEditor";
import { SelectWithCustomOption } from "./fields/SelectWithCustomOption";
import { BasicInputField } from "./fields/BasicInputField";
import { CategoryField } from "./fields/CategoryField";
import { SubcategoryField } from "./fields/SubcategoryField";
import { FeatureField } from "./fields/FeatureField";
import { DegreeField } from "./fields/DegreeField";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "array" | "image" | "degree" | "category" | "subcategory" | "select" | "datetime-local" | "richtext";
  bucket?: string;
  required?: boolean;
  options?: Array<{ id: string; title?: string; name?: string; }>;
  dependsOn?: string;
  watch?: any;
  control?: any;
  component?: any;
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
  watch,
  component
}: FormFieldProps) {
  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: name === 'school_id'
  });

  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      if (error) throw error;
      return data || [];
    },
    enabled: name === 'academic_major_id'
  });

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: name === 'company_id'
  });

  const { data: careers } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      if (error) throw error;
      return data || [];
    },
    enabled: name === 'position'
  });

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
      render={({ field }) => {
        switch (type) {
          case "degree":
            return (
              <DegreeField
                field={field}
                label={label}
                description={description}
                required={required}
              />
            );
            
          case "category":
            return (
              <CategoryField
                field={field}
                label={label}
                description={description}
                required={required}
              />
            );
          
          case "subcategory":
            return (
              <SubcategoryField
                field={field}
                label={label}
                description={description}
                required={required}
                selectedCategory={watch && watch(dependsOn || "")}
              />
            );

          case "select":
            if (name === "position") {
              return (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={careers || []}
                  placeholder={placeholder || "Select position"}
                  tableName="careers"
                />
              );
            } else if (name === "company_id") {
              return (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={companies || []}
                  placeholder={placeholder || "Select company"}
                  tableName="companies"
                />
              );
            } else if (name === "school_id") {
              return (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={schools || []}
                  placeholder={placeholder || "Select your school"}
                  tableName="schools"
                />
              );
            } else if (name === "academic_major_id") {
              return (
                <SelectWithCustomOption
                  value={field.value || ""}
                  onValueChange={field.onChange}
                  options={majors || []}
                  placeholder={placeholder || "Select major"}
                  tableName="majors"
                />
              );
            }

          case "richtext":
            if (component) {
              const RichTextComponent = component;
              return (
                <RichTextComponent
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={placeholder}
                />
              );
            }
            return (
              <BasicInputField
                field={field}
                label={label}
                placeholder={placeholder}
                description={description}
                required={required}
                type="text"
              />
            );

          case "checkbox":
            return (
              <FeatureField
                field={field}
                label={label}
                description={description}
              />
            );

          case "datetime-local":
            return (
              <BasicInputField
                field={field}
                label={label}
                placeholder={placeholder}
                description={description}
                type="datetime-local"
                required={required}
              />
            );

          default:
            return (
              <BasicInputField
                field={field}
                label={label}
                placeholder={placeholder}
                description={description}
                type={type === "number" ? "number" : "text"}
                required={required}
              />
            );
        }
      }}
    />
  );
}