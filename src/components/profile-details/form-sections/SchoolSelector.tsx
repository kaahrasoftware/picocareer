
import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface SchoolSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function SchoolSelector({ value, onValueChange }: SchoolSelectorProps) {
  const { schools } = useMentorReferenceData();

  // Ensure schoolOptions is always an array, even when schools is undefined
  const schoolOptions = React.useMemo(() => {
    if (!Array.isArray(schools)) return [];
    return schools.map(school => ({
      value: school.id,
      label: school.name
    }));
  }, [schools]);

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
