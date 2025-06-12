
import React from 'react';
import { FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface MultiSelectProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  options: { value: string; label: string; }[];
  placeholder?: string;
}

export function MultiSelect({ value = [], onChange, options, placeholder }: MultiSelectProps) {
  const handleValueChange = (selectedValue: string) => {
    if (!onChange) return;
    
    if (value.includes(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  return (
    <FormControl>
      <Select onValueChange={handleValueChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select options..."}>
            {value.length > 0 ? `${value.length} selected` : placeholder}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormControl>
  );
}
