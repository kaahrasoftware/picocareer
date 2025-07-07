
import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface SchoolSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SchoolSelector({ value, onValueChange }: SchoolSelectorProps) {
  const { schools } = useMentorReferenceData();

  const schoolOptions = schools?.map(school => ({
    value: school.id,
    label: school.name
  })) || [];

  return (
    <SearchableSelect
      options={schoolOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select School"
      searchPlaceholder="Search schools..."
      emptyMessage="No schools found."
    />
  );
}
