import React from 'react';
import type { Profile } from '@/types/database/profiles';
import { EditableField } from '../EditableField';
import { SelectWithCustomOption } from '../editable/SelectWithCustomOption';

interface ProfessionalInfoSectionProps {
  profile: Profile | null;
  isMentee: boolean;
}

export function ProfessionalInfoSection({ profile, isMentee }: ProfessionalInfoSectionProps) {
  if (isMentee || !profile) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Professional Experience</h4>
      <div className="text-muted-foreground">
        <span className="font-medium">Position:</span>
        <SelectWithCustomOption
          value={profile.position || ''}
          options={[]} // Will be fetched in the component
          placeholder="Select a career"
          tableName="careers"
          onSelect={(value) => {
            // This will be handled in the SelectWithCustomOption component
          }}
          onCancel={() => {
            // This will be handled in the SelectWithCustomOption component
          }}
        />
      </div>
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