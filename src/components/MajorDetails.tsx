
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MajorDetailsContent } from './major-details/MajorDetailsContent';
import { MajorDetailsErrorState } from './major-details/MajorDetailsErrorState';
import { MajorDialogHeader } from './major-details/MajorDialogHeader';
import type { Database } from '@/integrations/supabase/types';

type Major = Database['public']['Tables']['majors']['Row'];

const MajorDetails = () => {
  const { id } = useParams();

  const { data: major, isLoading, error } = useQuery({
    queryKey: ['major', id],
    queryFn: async () => {
      if (!id) throw new Error('Major ID is required');
      
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !major) {
    return <MajorDetailsErrorState />;
  }

  return (
    <div className="container mx-auto py-8">
      <MajorDialogHeader major={major} />
      <MajorDetailsContent major={major} />
    </div>
  );
};

export default MajorDetails;
