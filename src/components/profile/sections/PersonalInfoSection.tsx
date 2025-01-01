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
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <EditableField
            label="First Name"
            value={profile.first_name}
            fieldName="first_name"
            profileId={profile.id}
          />
        </div>
        <div>
          <EditableField
            label="Last Name"
            value={profile.last_name}
            fieldName="last_name"
            profileId={profile.id}
          />
        </div>
      </div>

      <EditableField
        label="Email"
        value={profile.email}
        fieldName="email"
        profileId={profile.id}
      />

      <EditableField
        label="Location"
        value={profile.location}
        fieldName="location"
        profileId={profile.id}
      />

      <div className="space-y-2">
        <h5 className="text-sm font-medium">Social Media</h5>
        <EditableField
          label="X (Twitter)"
          value={profile.X_url}
          fieldName="X_url"
          profileId={profile.id}
        />
        <EditableField
          label="TikTok"
          value={profile.tiktok_url}
          fieldName="tiktok_url"
          profileId={profile.id}
        />
        <EditableField
          label="Instagram"
          value={profile.instagram_url}
          fieldName="instagram_url"
          profileId={profile.id}
        />
        <EditableField
          label="Facebook"
          value={profile.facebook_url}
          fieldName="facebook_url"
          profileId={profile.id}
        />
        <EditableField
          label="YouTube"
          value={profile.youtube_url}
          fieldName="youtube_url"
          profileId={profile.id}
        />
      </div>

      {profile.languages && (
        <EditableField
          label="Languages"
          value={profile.languages.join(", ")}
          fieldName="languages"
          profileId={profile.id}
        />
      )}
    </div>
  );
}