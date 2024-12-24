import React from 'react';
import type { Profile } from '@/types/database/profiles';

interface LocationSectionProps {
  profile: Profile | null;
}

export function LocationSection({ profile }: LocationSectionProps) {
  if (!profile?.location) return null;

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">Location</h4>
      <p className="text-muted-foreground">{profile.location}</p>
    </div>
  );
}