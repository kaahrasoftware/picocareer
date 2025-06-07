
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContentTypeFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
}

const contentTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'scholarships', label: 'Scholarships' },
  { value: 'opportunities', label: 'Opportunities' },
  { value: 'events', label: 'Events' },
  { value: 'careers', label: 'Careers' },
  { value: 'majors', label: 'Majors' },
  { value: 'schools', label: 'Schools' },
  { value: 'mentors', label: 'Mentors' },
  { value: 'blogs', label: 'Blog Posts' }
];

export function ContentTypeFilter({ value, onChange }: ContentTypeFilterProps) {
  return (
    <Select
      value={value || 'all'}
      onValueChange={(newValue) => onChange(newValue === 'all' ? null : newValue)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Filter by content type" />
      </SelectTrigger>
      <SelectContent>
        {contentTypeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
