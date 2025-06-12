
import React from 'react';
import { BookingFormDebug } from './BookingFormDebug';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BookingFormDebugWrapperProps {
  mentorId: string;
  onFormChange: (formData: any) => void;
  onSuccess: () => void;
}

export function BookingFormDebugWrapper({ mentorId, onFormChange, onSuccess }: BookingFormDebugWrapperProps) {
  // Fetch mentor details to get the name
  const { data: mentorProfile, isLoading } = useQuery({
    queryKey: ['mentor-profile', mentorId],
    queryFn: async () => {
      console.log('🔍 Debug: Fetching mentor profile for ID:', mentorId);
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('id', mentorId)
        .single();
      
      if (error) {
        console.error('❌ Debug: Error fetching mentor profile:', error);
        throw error;
      }
      
      console.log('✅ Debug: Mentor profile fetched:', data);
      return data;
    },
    enabled: !!mentorId
  });

  if (isLoading) {
    return <div>Loading mentor information...</div>;
  }

  const mentorName = mentorProfile?.full_name || 'Unknown Mentor';

  console.log('🎯 Debug: Rendering BookingFormDebug with mentor name:', mentorName);

  return (
    <BookingFormDebug
      mentorId={mentorId}
      mentorName={mentorName}
      onFormChange={onFormChange}
      onSuccess={onSuccess}
    />
  );
}
