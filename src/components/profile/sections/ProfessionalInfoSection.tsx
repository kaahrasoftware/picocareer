import React from 'react';
import type { Profile } from '@/types/database/profiles';

interface ProfessionalInfoSectionProps {
  profile: Profile | null;
  isMentee: boolean;
}

export function ProfessionalInfoSection({ profile, isMentee }: ProfessionalInfoSectionProps) {
  if (isMentee) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Professional Experience</h4>
      {profile?.career?.title && (
        <div className="text-muted-foreground">
          <span className="font-medium">Position:</span> {profile.career.title}
        </div>
      )}
      {profile?.company_name && (
        <div className="text-muted-foreground">
          <span className="font-medium">Company:</span> {profile.company_name}
        </div>
      )}
      {profile?.years_of_experience !== null && (
        <div className="text-muted-foreground">
          <span className="font-medium">Years of Experience:</span> {profile.years_of_experience}
        </div>
      )}
    </div>
  );
}