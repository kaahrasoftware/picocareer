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
      <EditableField
        label="Bio"
        value={profile.bio}
        fieldName="bio"
        profileId={profile.id}
      />
      <EditableField
        label="LinkedIn URL"
        value={profile.linkedin_url}
        fieldName="linkedin_url"
        profileId={profile.id}
      />
      <EditableField
        label="GitHub URL"
        value={profile.github_url}
        fieldName="github_url"
        profileId={profile.id}
      />
      <EditableField
        label="Website URL"
        value={profile.website_url}
        fieldName="website_url"
        profileId={profile.id}
      />
      <EditableField
        label="Skills"
        value={profile.skills?.join(', ')}
        fieldName="skills"
        profileId={profile.id}
      />
      <EditableField
        label="Tools Used"
        value={profile.tools_used?.join(', ')}
        fieldName="tools_used"
        profileId={profile.id}
      />
      <EditableField
        label="Fields of Interest"
        value={profile.fields_of_interest?.join(', ')}
        fieldName="fields_of_interest"
        profileId={profile.id}
      />
    </div>
  );
}