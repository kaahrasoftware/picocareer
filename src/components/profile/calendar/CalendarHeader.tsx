import React from "react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import type { Profile } from "@/types/database/profiles";

interface CalendarHeaderProps {
  profile: Profile;
}

export function CalendarHeader({ profile }: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <ProfileAvatar 
        avatarUrl={profile.avatar_url}
        fallback={profile.full_name?.[0] || 'U'}
        size="lg"
      />
      <div>
        <h2 className="text-2xl font-bold">{profile.full_name}</h2>
        <p className="text-muted-foreground">{profile.email}</p>
      </div>
    </div>
  );
}