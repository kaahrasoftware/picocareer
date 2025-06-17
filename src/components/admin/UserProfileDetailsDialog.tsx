
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProfileEditForm } from "@/components/profile-details/ProfileEditForm";
import { useState } from "react";

interface ExtendedProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  user_type?: string;
}

interface UserProfileDetailsDialogProps {
  profile: ExtendedProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDetailsDialog({
  profile,
  open,
  onOpenChange
}: UserProfileDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Profile Details</DialogTitle>
        </DialogHeader>
        
        {isEditing ? (
          <ProfileEditForm
            profile={profile}
            onClose={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
            onSuccess={() => {
              setIsEditing(false);
              onOpenChange(false);
            }}
          />
        ) : (
          <div className="space-y-4">
            <div>
              <strong>Name:</strong> {profile.full_name}
            </div>
            <div>
              <strong>Email:</strong> {profile.email}
            </div>
            {profile.bio && (
              <div>
                <strong>Bio:</strong> {profile.bio}
              </div>
            )}
            {profile.location && (
              <div>
                <strong>Location:</strong> {profile.location}
              </div>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded"
            >
              Edit Profile
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
