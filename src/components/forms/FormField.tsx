import React from "react";
import { FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithCustomOption } from "./fields/SelectWithCustomOption";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface FormFieldProps {
  name: string;
  control?: any; // Made optional since it's provided at runtime
  label: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  options?: { value: string; label: string; }[];
  tableName?: string;
  description?: string;
  bucket?: string;
  dependsOn?: string;
  watch?: any;
  children?: React.ReactNode;
  component?: React.ComponentType<any>; // Add component prop for backwards compatibility
}

interface InputFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}

interface TextAreaFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  required?: boolean;
}

interface CheckboxFieldProps {
  name: string;
  control: any;
  label: string;
}

interface SelectFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  options: { value: string; label: string; }[];
  required?: boolean;
}

interface DynamicSelectFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  tableName: string;
  required?: boolean;
}

const InputField = ({ control, name, label, placeholder, required, type = "text" }: InputFieldProps) => (
  <ShadcnFormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Input placeholder={placeholder} required={required} type={type} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const TextAreaField = ({ control, name, label, placeholder, required }: TextAreaFieldProps) => (
  <ShadcnFormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Textarea placeholder={placeholder} required={required} {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

const CheckboxField = ({ control, name, label }: CheckboxFieldProps) => (
  <ShadcnFormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>{label}</FormLabel>
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);

const SelectField = ({ control, name, label, placeholder, options, required }: SelectFieldProps) => (
  <ShadcnFormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <Select onValueChange={field.onChange} defaultValue={field.value}>
          <FormControl>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
          </FormControl>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FormMessage />
      </FormItem>
    )}
  />
);

const DynamicSelectField = ({ control, name, label, placeholder, tableName, required }: DynamicSelectFieldProps) => {
  const { data: options = [] } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      let selectQuery = 'id, title, name';
      
      if (tableName === 'majors') {
        selectQuery = 'id, title';
      } else if (tableName === 'careers') {
        selectQuery = 'id, title';
      } else if (tableName === 'schools') {
        selectQuery = 'id, name';
      }
      
      const { data, error } = await supabase
        .from(tableName as any)
        .select(selectQuery)
        .eq('status', 'Approved');
      
      if (error) throw error;
      return data || [];
    }
  });

  const formattedOptions = options.map((option: any) => ({
    id: option.id,
    name: option.title || option.name
  }));

  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          <FormControl>
            <SelectWithCustomOption
              value={field.value}
              onValueChange={field.onChange}
              options={formattedOptions}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormField = ({ name, control, label, required, children, type, placeholder, options, tableName, component }: FormFieldProps) => {
  // Handle component prop for backwards compatibility
  if (component) {
    const Component = component;
    return <Component name={name} control={control} label={label} required={required} type={type} placeholder={placeholder} options={options} tableName={tableName} />;
  }

  // Handle different field types based on props
  if (type === "textarea") {
    return <TextAreaField control={control} name={name} label={label} placeholder={placeholder} required={required} />;
  }
  
  if (type === "checkbox") {
    return <CheckboxField control={control} name={name} label={label} />;
  }
  
  if (type === "select" && options) {
    return <SelectField control={control} name={name} label={label} placeholder={placeholder} options={options} required={required} />;
  }
  
  if (type === "dynamic-select" && tableName) {
    return <DynamicSelectField control={control} name={name} label={label} placeholder={placeholder} tableName={tableName} required={required} />;
  }
  
  if (type && ["text", "email", "number", "password", "tel", "url", "datetime-local"].includes(type)) {
    return <InputField control={control} name={name} label={label} placeholder={placeholder} required={required} type={type} />;
  }

  // Default custom field with children
  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-red-500">*</span>}
          </FormLabel>
          {children}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

FormField.Input = InputField;
FormField.TextArea = TextAreaField;
FormField.Checkbox = CheckboxField;
FormField.Select = SelectField;
FormField.DynamicSelect = DynamicSelectField;
