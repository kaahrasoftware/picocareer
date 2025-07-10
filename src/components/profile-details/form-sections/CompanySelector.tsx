
import React from 'react';
import { CustomSearchableSelect } from '@/components/common/CustomSearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';

interface CompanySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CompanySelector({ value, onValueChange }: CompanySelectorProps) {
  const { companies, isLoading } = useMentorReferenceData();

  // Ensure companyOptions is always an array, even when companies is undefined
  const companyOptions = React.useMemo(() => {
    if (!Array.isArray(companies)) return [];
    return companies.map(company => ({
      value: company.id,
      label: company.name
    }));
  }, [companies]);

  return (
    <CustomSearchableSelect
      options={companyOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Company"
      searchPlaceholder="Search companies..."
      emptyMessage="No companies found."
      disabled={isLoading.companies}
      loading={isLoading.companies}
    />
  );
}
