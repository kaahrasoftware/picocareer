
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FrequencyFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const frequencyOptions = [
  { value: 'all', label: 'All Frequencies' },
  { value: 'once', label: 'One-time' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

export function FrequencyFilter({ value, onChange }: FrequencyFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(newValue) => onChange(newValue === 'all' ? null : newValue)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Filter by frequency" />
      </SelectTrigger>
      <SelectContent>
        {frequencyOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
