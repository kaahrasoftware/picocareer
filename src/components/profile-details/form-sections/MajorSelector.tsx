
import React from 'react';
import { CustomSearchableSelect } from '@/components/common/CustomSearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface MajorSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function MajorSelector({ value, onValueChange }: MajorSelectorProps) {
  const { majors, isLoading } = useMentorReferenceData();

  // Ensure majorOptions is always an array, even when majors is undefined
  const majorOptions = React.useMemo(() => {
    if (!Array.isArray(majors)) return [];
    return majors.map(major => ({
      value: major.id,
      label: major.title
    }));
  }, [majors]);

  return (
    <CustomSearchableSelect
      options={majorOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Academic Major"
      searchPlaceholder="Search majors..."
      emptyMessage="No majors found."
      disabled={isLoading.majors}
      loading={isLoading.majors}
    />
  );
}
