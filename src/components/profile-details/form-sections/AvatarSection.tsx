
import React from 'react';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { Label } from '@/components/ui/label';

interface AvatarSectionProps {
  avatarUrl?: string;
  userId: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarSection({ avatarUrl, userId, onAvatarUpdate }: AvatarSectionProps) {
  return (
    <div className="space-y-4">
      <h4 className="font-semibold">Profile Picture</h4>
      <div className="flex items-center space-x-4">
        <ProfileAvatar
          avatarUrl={avatarUrl}
          userId={userId}
          size="lg"
          editable={true}
          onAvatarUpdate={onAvatarUpdate}
        />
        <div>
          <Label className="text-sm text-muted-foreground">
            Click on your avatar to change your profile picture
          </Label>
        </div>
      </div>
    </div>
  );
}
