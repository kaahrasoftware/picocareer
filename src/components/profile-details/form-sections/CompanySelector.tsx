
import React, { useState } from 'react';
import { CustomSearchableSelect } from '@/components/common/CustomSearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CompanySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function CompanySelector({ value, onValueChange }: CompanySelectorProps) {
  const { companies, isLoading } = useMentorReferenceData();
  const [localCompanies, setLocalCompanies] = useState<any[]>([]);

  // Combine server companies with locally added ones
  const allCompanies = React.useMemo(() => {
    const serverCompanies = Array.isArray(companies) ? companies : [];
    return [...serverCompanies, ...localCompanies];
  }, [companies, localCompanies]);

  // Ensure companyOptions is always an array
  const companyOptions = React.useMemo(() => {
    return allCompanies.map(company => ({
      value: company.id,
      label: company.name
    }));
  }, [allCompanies]);

  const handleAddCustomCompany = async (companyName: string) => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([
          {
            name: companyName,
            status: 'Approved'
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately for better UX
      setLocalCompanies(prev => [...prev, data]);
      
      // Select the newly created company
      onValueChange(data.id);
      
      toast.success('Company added successfully!');
    } catch (error) {
      console.error('Error adding company:', error);
      toast.error('Failed to add company. Please try again.');
      throw error;
    }
  };

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
      allowCustom={true}
      onAddCustom={handleAddCustomCompany}
      customOptionLabel="Add company"
    />
  );
}
