
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MajorDetailsContent } from './major-details/MajorDetailsContent';
import { MajorDetailsErrorState } from './major-details/MajorDetailsErrorState';
import { MajorDialogHeader } from './major-details/MajorDialogHeader';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { Database } from '@/integrations/supabase/types';

type Major = Database['public']['Tables']['majors']['Row'];

interface MajorDetailsProps {
  major?: Major;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function MajorDetails({ major: propMajor, open, onOpenChange }: MajorDetailsProps) {
  const { id } = useParams();
  const majorId = propMajor?.id || id;

  const { data: major, isLoading, error } = useQuery({
    queryKey: ['major', majorId],
    queryFn: async () => {
      if (!majorId) throw new Error('Major ID is required');
      
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .eq('id', majorId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!majorId,
  });

  const majorData = propMajor || major;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !majorData) {
    return <MajorDetailsErrorState open={open || false} onOpenChange={onOpenChange || (() => {})} />;
  }

  // If used as a dialog
  if (open !== undefined && onOpenChange) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <MajorDialogHeader major={majorData} />
          <MajorDetailsContent major={majorData} />
        </DialogContent>
      </Dialog>
    );
  }

  // If used as a page
  return (
    <div className="container mx-auto py-8">
      <MajorDialogHeader major={majorData} />
      <MajorDetailsContent major={majorData} />
    </div>
  );
}

export default MajorDetails;
