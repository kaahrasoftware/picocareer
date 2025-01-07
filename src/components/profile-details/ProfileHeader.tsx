import { ProfileAvatar } from "./ProfileAvatar";
import type { Session } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  profile: any;
  session: Session | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar avatarUrl={profile.avatar_url} />
      <div>
        <h2 className="text-2xl font-bold">{profile.full_name}</h2>
        <p className="text-muted-foreground">{profile.email}</p>
      </div>
    </div>
  );
}