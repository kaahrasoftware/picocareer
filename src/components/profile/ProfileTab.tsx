import React, { useState } from 'react';
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { EditableField } from "@/components/profile/EditableField";
import { useUserProfile } from "@/hooks/useUserProfile";

export function ProfileTab() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: profile } = useUserProfile();

  if (!profile) {
    return null;
  }

  if (isEditing) {
    return <ProfileEditForm onCancel={() => setIsEditing(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <EditableField
                label="First Name"
                value={profile.first_name}
                fieldName="first_name"
                profileId={profile.id}
                placeholder="Add your first name"
              />
              <EditableField
                label="Last Name"
                value={profile.last_name}
                fieldName="last_name"
                profileId={profile.id}
                placeholder="Add your last name"
              />
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bio</h3>
            <ProfileBio bio={profile.bio} />
          </div>
        </div>

        {/* School Information */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-4">School Information</h3>
            <div className="text-sm text-muted-foreground">
              {profile.school_id ? (
                "School information available"
              ) : (
                "No school information added"
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}