
import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface MajorSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function MajorSelector({ value, onValueChange }: MajorSelectorProps) {
  const { majors } = useMentorReferenceData();

  const majorOptions = majors?.map(major => ({
    value: major.id,
    label: major.title
  })) || [];

  return (
    <SearchableSelect
      options={majorOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Academic Major"
      searchPlaceholder="Search majors..."
      emptyMessage="No majors found."
    />
  );
}
