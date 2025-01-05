import type { Profile } from "@/types/database/profiles";
import type { Session } from "@supabase/supabase-js";

interface ProfileTabProps {
  profile: Profile;
  session: Session | null;
}

export function ProfileTab({ profile, session }: ProfileTabProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Profile Details</h2>
      <div className="flex items-center space-x-4">
        <img src={profile.avatar_url || '/default-avatar.png'} alt={profile.full_name} className="h-16 w-16 rounded-full" />
        <div>
          <h3 className="text-lg font-semibold">{profile.full_name}</h3>
          <p className="text-sm text-muted-foreground">{profile.email}</p>
        </div>
      </div>
      <div>
        <h4 className="text-lg font-semibold">Bio</h4>
        <p>{profile.bio || 'No bio available.'}</p>
      </div>
      <div>
        <h4 className="text-lg font-semibold">Fields of Interest</h4>
        <p>{profile.fields_of_interest?.join(', ') || 'No fields of interest specified.'}</p>
      </div>
      {session && (
        <div>
          <h4 className="text-lg font-semibold">Current Session</h4>
          <p>{session.id}</p>
        </div>
      )}
    </div>
  );
}
