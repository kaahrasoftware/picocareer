
import React from 'react';
import { FormField as ShadcnFormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SelectWithCustomOption } from './fields/SelectWithCustomOption';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

export interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'select-with-custom' | 'datetime-local';
  placeholder?: string;
  options?: Array<{ id: string; title?: string; name?: string; label?: string; value?: string }>;
  tableName?: string;
  description?: string;
  required?: boolean;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  type = 'text',
  placeholder,
  options = [],
  tableName,
  description,
  required = false
}: FormFieldProps<T>) {
  const renderField = (field: any) => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea 
            placeholder={placeholder} 
            {...field} 
            className="min-h-[100px]"
          />
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox 
              checked={field.value} 
              onCheckedChange={field.onChange}
              id={name}
            />
            <label htmlFor={name} className="text-sm">
              {description || label}
            </label>
          </div>
        );
      
      case 'select':
        return (
          <Select onValueChange={field.onChange} value={field.value}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.id || option.value} 
                  value={option.id || option.value || ''}
                >
                  {option.title || option.name || option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'select-with-custom':
        if (!tableName) {
          console.warn('tableName is required for select-with-custom type');
          return <Input placeholder={placeholder} {...field} />;
        }
        
        // Normalize options to have consistent structure
        const normalizedOptions = options.map(option => ({
          id: option.id || option.value || '',
          title: option.title,
          name: option.name
        }));

        return (
          <SelectWithCustomOption
            selectedValue={field.value || ''}
            value={field.value}
            onValueChange={field.onChange}
            options={normalizedOptions}
            placeholder={placeholder || `Select ${label.toLowerCase()}`}
            tableName={tableName}
          />
        );

      case 'datetime-local':
        return (
          <Input 
            type="datetime-local" 
            placeholder={placeholder} 
            {...field} 
          />
        );
      
      default:
        return (
          <Input 
            type={type} 
            placeholder={placeholder} 
            {...field} 
          />
        );
    }
  };

  return (
    <ShadcnFormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            {renderField(field)}
          </FormControl>
          {description && type !== 'checkbox' && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
