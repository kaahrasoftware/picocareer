import React from "react";

interface ProfileAvatarProps {
  avatarUrl: string | null;
}

export function ProfileHeaderAvatar({ avatarUrl }: ProfileAvatarProps) {
  return (
    <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-yellow-400">
      <img
        src={avatarUrl || "/placeholder.svg"}
        alt="Profile"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export { ProfileHeaderAvatar as ProfileAvatar };