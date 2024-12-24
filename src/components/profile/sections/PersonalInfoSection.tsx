import React from 'react';
import type { Profile } from '@/types/database/profiles';

interface PersonalInfoSectionProps {
  profile: Profile | null;
}

export function PersonalInfoSection({ profile }: PersonalInfoSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">Personal Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <p className="text-muted-foreground">
          <span className="font-medium">First Name:</span> {profile?.first_name}
        </p>
        <p className="text-muted-foreground">
          <span className="font-medium">Last Name:</span> {profile?.last_name}
        </p>
      </div>
    </div>
  );
}