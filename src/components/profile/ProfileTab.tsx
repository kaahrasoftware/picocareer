import React, { useState } from 'react';
import { ProfileBio } from "@/components/profile-details/ProfileBio";
import { ProfileEducation } from "@/components/profile-details/ProfileEducation";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { EditableField } from "@/components/profile/EditableField";
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile & {
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    career_title?: string | null;
  };
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-left">Profile Details</h2>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant="outline"
          className="gap-2"
        >
          <Pencil className="h-4 w-4" />
          {isEditing ? "Cancel Editing" : "Edit Profile"}
        </Button>
      </div>
      
      {isEditing ? (
        <ProfileEditForm 
          profile={profile} 
          onCancel={() => setIsEditing(false)}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <>
          <div className="bg-muted rounded-lg p-6 shadow-sm space-y-4">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Personal Information</h4>
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

          <ProfileBio 
            bio={profile.bio} 
            profileId={profile.id}
          />

          <div className="bg-muted rounded-lg p-6 shadow-sm">
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Education</h4>
              <EditableField
                label="School"
                value={profile.school_name || ''}
                fieldName="school_id"
                profileId={profile.id}
                placeholder="Select your school"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}