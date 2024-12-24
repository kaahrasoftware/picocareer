import React from 'react';
import type { Profile } from '@/types/database/profiles';
import { EditableField } from '../EditableField';

interface LocationSectionProps {
  profile: Profile | null;
}

export function LocationSection({ profile }: LocationSectionProps) {
  if (!profile?.location) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Location</h4>
      <EditableField
        label="Location"
        value={profile.location}
        fieldName="location"
        profileId={profile.id}
      />
    </div>
  );
}