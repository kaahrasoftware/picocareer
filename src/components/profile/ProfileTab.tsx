
import React, { useState } from 'react';
import { ProfileView } from '@/components/profile-details/ProfileView';
import { ProfileEditForm } from '@/components/profile-details/ProfileEditForm';
import { Button } from '@/components/ui/button';
import { Pencil, X } from 'lucide-react';
import type { Profile } from "@/types/database/profiles";

interface ProfileTabProps {
  profile: Profile;
}

export function ProfileTab({ profile }: ProfileTabProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSuccess = () => {
    setIsEditing(false);
    // Optionally show a success message or refresh data
  };

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Edit Profile</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
        <ProfileEditForm
          profile={profile}
          onCancel={handleCancel}
          onSuccess={handleSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Profile Details</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="flex items-center gap-2 opacity-70 hover:opacity-100 transition-opacity"
        >
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
      </div>
      <ProfileView profile={profile} />
    </div>
  );
}
