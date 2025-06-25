
import React from 'react';
import type { Profile } from '@/types/database/profiles';
import { EditableField } from '../EditableField';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface ProfessionalInfoSectionProps {
  profile: Profile | null;
  isMentee: boolean;
}

export function ProfessionalInfoSection({ profile, isMentee }: ProfessionalInfoSectionProps) {
  // Don't render anything for mentees
  if (isMentee) return null;

  const { data: careers, error: careersError } = useQuery({
    queryKey: ['careers-for-profile'],
    queryFn: async () => {
      console.log('Fetching careers data...');
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');

      if (error) {
        console.error('Error fetching careers:', error);
        throw error;
      }

      console.log('Careers data fetched:', data);
      return data;
    },
  });

  if (careersError) {
    console.error('Error in careers query:', careersError);
  }

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Professional Experience</h4>
      <EditableField
        label="Position"
        value={profile?.current_position}
        fieldName="current_position"
        profileId={profile?.id || ''}
      />
      <EditableField
        label="Company"
        value={profile?.current_company}
        fieldName="current_company"
        profileId={profile?.id || ''}
      />
      <EditableField
        label="Years of Experience"
        value={profile?.years_of_experience?.toString()}
        fieldName="years_of_experience"
        profileId={profile?.id || ''}
      />
    </div>
  );
}
