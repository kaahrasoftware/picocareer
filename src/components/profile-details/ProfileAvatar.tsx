import { ProfileAvatar } from "@/components/ui/profile-avatar";

interface ProfileAvatarProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
  } | null;
  onAvatarUpdate: (blob: Blob) => Promise<void>;
}

export function ProfileHeaderAvatar({ profile, onAvatarUpdate }: ProfileAvatarProps) {
  if (!profile) return null;

  return (
    <ProfileAvatar
      avatarUrl={profile.avatar_url}
      fallback={profile.full_name?.[0] || 'U'}
      size="lg"
      editable={true}
      onAvatarUpdate={onAvatarUpdate}
    />
  );
}