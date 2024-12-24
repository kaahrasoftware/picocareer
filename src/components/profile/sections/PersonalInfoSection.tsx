import React from 'react';
import type { Profile } from '@/types/database/profiles';
import { EditableField } from '../EditableField';

interface PersonalInfoSectionProps {
  profile: Profile | null;
}

export function PersonalInfoSection({ profile }: PersonalInfoSectionProps) {
  if (!profile) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold mb-4">Personal Information</h4>
      <EditableField
        label="First Name"
        value={profile.first_name}
        fieldName="first_name"
        profileId={profile.id}
      />
      <EditableField
        label="Last Name"
        value={profile.last_name}
        fieldName="last_name"
        profileId={profile.id}
      />
    </div>
  );
}