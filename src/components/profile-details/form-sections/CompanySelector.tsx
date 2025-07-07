
import React from 'react';
import { SearchableSelect } from '@/components/common/SearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface CompanySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CompanySelector({ value, onValueChange }: CompanySelectorProps) {
  const { companies } = useMentorReferenceData();

  const companyOptions = companies?.map(company => ({
    value: company.id,
    label: company.name
  })) || [];

  return (
    <SearchableSelect
      options={companyOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Company"
      searchPlaceholder="Search companies..."
      emptyMessage="No companies found."
    />
  );
}
