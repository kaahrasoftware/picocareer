import React from "react";

export interface ProfileAvatarProps {
  avatarUrl: string | null;
  profileId?: string;
  size?: "sm" | "md" | "lg";
  editable?: boolean;
  fallback?: string;
}

export function ProfileHeaderAvatar({ 
  avatarUrl, 
  profileId,
  size = "md",
  editable = false,
  fallback = "User"
}: ProfileAvatarProps) {
  return (
    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-400">
      <img
        src={avatarUrl || "/placeholder.svg"}
        alt={fallback}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export { ProfileHeaderAvatar as ProfileAvatar };