
import React from "react";
import { FormControl, FormField as ShadcnFormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectWithCustomOption } from "./fields/SelectWithCustomOption";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface FormFieldProps {
  name: string;
  control?: any;
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
  component?: React.ComponentType<any>;
}

interface InputFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
  description?: string;
}

interface TextAreaFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
}

interface CheckboxFieldProps {
  name: string;
  control: any;
  label: string;
  description?: string;
}

interface SelectFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  options: { value: string; label: string; }[];
  required?: boolean;
  description?: string;
}

interface DynamicSelectFieldProps {
  name: string;
  control: any;
  label: string;
  placeholder?: string;
  tableName: string;
  required?: boolean;
  description?: string;
}

const InputField = ({ control, name, label, placeholder, required, type = "text", description }: InputFieldProps) => (
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
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const TextAreaField = ({ control, name, label, placeholder, required, description }: TextAreaFieldProps) => (
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
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const CheckboxField = ({ control, name, label, description }: CheckboxFieldProps) => (
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
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);

const SelectField = ({ control, name, label, placeholder, options, required, description }: SelectFieldProps) => (
  <ShadcnFormField
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <Select onValueChange={field.onChange} value={field.value}>
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
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

const DynamicSelectField = ({ control, name, label, placeholder, tableName, required, description }: DynamicSelectFieldProps) => {
  const { toast } = useToast();
  
  const { data: options = [], refetch } = useQuery({
    queryKey: [tableName],
    queryFn: async () => {
      let selectQuery = 'id, title, name';
      
      if (tableName === 'majors') {
        selectQuery = 'id, title';
      } else if (tableName === 'careers') {
        selectQuery = 'id, title';
      } else if (tableName === 'schools') {
        selectQuery = 'id, name';
      } else if (tableName === 'companies') {
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

  const handleAddNew = async (name: string): Promise<void> => {
    try {
      let insertData: any = {
        status: 'Pending'
      };

      if (tableName === 'majors' || tableName === 'careers') {
        insertData.title = name;
        if (tableName === 'careers') {
          insertData.description = `Custom position: ${name}`;
        } else {
          insertData.description = `Custom major: ${name}`;
        }
      } else {
        insertData.name = name;
      }

      const { data, error } = await supabase
        .from(tableName as any)
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      await refetch();

      // Auto-select the newly created item with proper null checks
      if (data && control?._fields?.[name]) {
        const fieldOnChange = control._fields[name]._f?.onChange;
        if (fieldOnChange && data && typeof data === 'object' && 'id' in data && data.id) {
          fieldOnChange(data.id);
        }
      }

      toast({
        title: "Success",
        description: `Successfully added new ${tableName === 'companies' ? 'company' : 
                     tableName === 'schools' ? 'school' : 
                     tableName === 'majors' ? 'major' : 'position'}.`,
      });
    } catch (error) {
      console.error(`Failed to add new ${tableName}:`, error);
      toast({
        title: "Error",
        description: `Failed to add new ${tableName}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const getAddNewLabel = () => {
    switch (tableName) {
      case 'companies':
        return 'Add New Company';
      case 'schools':
        return 'Add New School';
      case 'majors':
        return 'Add New Major';
      case 'careers':
        return 'Add New Position';
      default:
        return 'Add New';
    }
  };

  const getAddNewPlaceholder = () => {
    switch (tableName) {
      case 'companies':
        return 'Enter company name';
      case 'schools':
        return 'Enter school name';
      case 'majors':
        return 'Enter major name';
      case 'careers':
        return 'Enter position title';
      default:
        return 'Enter name';
    }
  };

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
              addNewLabel={getAddNewLabel()}
              addNewPlaceholder={getAddNewPlaceholder()}
              onAddNew={handleAddNew}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const FormField = ({ name, control, label, required, children, type, placeholder, options, tableName, description, component }: FormFieldProps) => {
  // Handle component prop for backwards compatibility
  if (component) {
    const Component = component;
    return <Component name={name} control={control} label={label} required={required} type={type} placeholder={placeholder} options={options} tableName={tableName} description={description} />;
  }

  // Handle different field types based on props
  if (type === "textarea") {
    return <TextAreaField control={control} name={name} label={label} placeholder={placeholder} required={required} description={description} />;
  }
  
  if (type === "checkbox") {
    return <CheckboxField control={control} name={name} label={label} description={description} />;
  }
  
  if (type === "select" && options) {
    return <SelectField control={control} name={name} label={label} placeholder={placeholder} options={options} required={required} description={description} />;
  }
  
  if (type === "dynamic-select" && tableName) {
    return <DynamicSelectField control={control} name={name} label={label} placeholder={placeholder} tableName={tableName} required={required} description={description} />;
  }
  
  if (type && ["text", "email", "number", "password", "tel", "url", "datetime-local"].includes(type)) {
    return <InputField control={control} name={name} label={label} placeholder={placeholder} required={required} type={type} description={description} />;
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
          {description && <FormDescription>{description}</FormDescription>}
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
