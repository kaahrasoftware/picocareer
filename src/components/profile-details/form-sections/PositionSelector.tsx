import React, { useState } from 'react';
import { CustomSearchableSelect } from '@/components/common/CustomSearchableSelect';
import { useMentorReferenceData } from '@/hooks/mentor/useMentorReferenceData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PositionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PositionSelector({ value, onValueChange }: PositionSelectorProps) {
  const { careers, isLoading } = useMentorReferenceData();
  const [localCareers, setLocalCareers] = useState<any[]>([]);

  // Combine server careers with locally added ones
  const allCareers = React.useMemo(() => {
    const serverCareers = Array.isArray(careers) ? careers : [];
    return [...serverCareers, ...localCareers];
  }, [careers, localCareers]);

  // Ensure careerOptions is always an array
  const careerOptions = React.useMemo(() => {
    return allCareers.map(career => ({
      value: career.id,
      label: career.title
    }));
  }, [allCareers]);

  const handleAddCustomPosition = async (positionTitle: string) => {
    try {
      const { data, error } = await supabase
        .from('careers')
        .insert([
          {
            title: positionTitle,
            description: `Custom position: ${positionTitle}`,
            status: 'Approved',
            token_cost: 0
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Add to local state immediately for better UX
      setLocalCareers(prev => [...prev, data]);
      
      // Select the newly created position
      onValueChange(data.id);
      
      toast.success('Position added successfully!');
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error('Failed to add position. Please try again.');
      throw error;
    }
  };

  return (
    <CustomSearchableSelect
      options={careerOptions}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select Position"
      searchPlaceholder="Search positions..."
      emptyMessage="No positions found."
      disabled={isLoading.careers}
      loading={isLoading.careers}
      allowCustom={true}
      onAddCustom={handleAddCustomPosition}
      customOptionLabel="Add position"
    />
  );
}