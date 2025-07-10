import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface PositionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PositionSelector({ value, onValueChange }: PositionSelectorProps) {
  const { careers, isLoading } = useMentorReferenceData();

  // Ensure careerOptions is always an array, even when careers is undefined
  const careerOptions = React.useMemo(() => {
    if (!Array.isArray(careers)) return [];
    return careers.map(career => ({
      value: career.id,
      label: career.title
    }));
  }, [careers]);

  return (
    <SearchableSelect
      options={careerOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Position"
      searchPlaceholder="Search positions..."
      emptyMessage="No positions found."
      disabled={isLoading.careers}
      loading={isLoading.careers}
    />
  );
}