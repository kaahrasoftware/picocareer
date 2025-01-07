import { DialogTitle } from "@/components/ui/dialog";
import { ProfileAvatar } from "./ProfileAvatar";
import type { Session } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  profile: any;
  session: Session | null;
}

export function ProfileHeader({ profile, session }: ProfileHeaderProps) {
  const isOwnProfile = session?.user?.id === profile?.id;

  return (
    <div className="flex items-center gap-4">
      <ProfileAvatar 
        avatarUrl={profile?.avatar_url}
        userId={profile?.id}
        onAvatarUpdate={(url) => {
          if (profile) {
            profile.avatar_url = url;
          }
        }}
        isEditable={isOwnProfile}
      />
      <div>
        <DialogTitle className="text-xl font-semibold">
          {profile?.full_name || 'Anonymous User'}
        </DialogTitle>
        <p className="text-sm text-muted-foreground">
          {profile?.email}
        </p>
      </div>
    </div>
  );
}