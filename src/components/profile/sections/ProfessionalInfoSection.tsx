import React from 'react';
import type { Profile } from '@/types/database/profiles';
import { EditableField } from '../EditableField';

interface ProfessionalInfoSectionProps {
  profile: Profile | null;
  isMentee: boolean;
}

export function ProfessionalInfoSection({ profile, isMentee }: ProfessionalInfoSectionProps) {
  if (isMentee) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Professional Experience</h4>
      {profile?.position && (
        <div className="text-muted-foreground">
          <span className="font-medium">Position:</span> {profile.career?.title}
        </div>
      )}
      <EditableField
        label="Company"
        value={profile.company_name}
        fieldName="company_name"
        profileId={profile.id}
      />
      <EditableField
        label="Years of Experience"
        value={profile.years_of_experience?.toString()}
        fieldName="years_of_experience"
        profileId={profile.id}
      />
    </div>
  );
}