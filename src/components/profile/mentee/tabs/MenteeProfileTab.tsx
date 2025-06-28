
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EditableField } from "@/components/profile/EditableField";
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import type { Profile } from "@/types/database/profiles";

interface MenteeProfileTabProps {
  profile: Profile;
  isEditing: boolean;
}

export function MenteeProfileTab({ profile, isEditing }: MenteeProfileTabProps) {
  const renderTags = (items: string[] | null, bgColor: string) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <Badge 
            key={`${item}-${index}`}
            className={`${bgColor} text-gray-700 hover:${bgColor}`}
          >
            {item}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <EditableField
              label="First Name"
              value={profile.first_name}
              fieldName="first_name"
              profileId={profile.id}
              placeholder="Add your first name"
              isEditing={isEditing}
            />
            <EditableField
              label="Last Name"
              value={profile.last_name}
              fieldName="last_name"
              profileId={profile.id}
              placeholder="Add your last name"
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>

      <ProfileBio 
        bio={profile.bio} 
        profileId={profile.id}
        isEditing={isEditing}
      />

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <div className="space-y-4">
          <EditableField
            label="Location"
            value={profile.location}
            fieldName="location"
            profileId={profile.id}
            placeholder="Add your location"
            isEditing={isEditing}
          />
          <EditableField
            label="Languages"
            value={(profile as any).languages?.join(", ")}
            fieldName="languages"
            profileId={profile.id}
            placeholder="Add languages (comma-separated)"
            isEditing={isEditing}
          />
        </div>
      </div>

      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Skills & Interests</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Skills</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.skills?.join(", ")}
                fieldName="skills"
                profileId={profile.id}
                placeholder="Add skills (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.skills, "bg-[#F2FCE2]")
            )}
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Fields of Interest</label>
            {isEditing ? (
              <EditableField
                label=""
                value={profile.fields_of_interest?.join(", ")}
                fieldName="fields_of_interest"
                profileId={profile.id}
                placeholder="Add fields of interest (comma-separated)"
                isEditing={isEditing}
              />
            ) : (
              renderTags(profile.fields_of_interest, "bg-[#E5DEFF]")
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
