
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { useDefaultAvatar } from "@/hooks/useDefaultAvatar";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();

  // Ensure user has a default avatar if they don't have one
  useDefaultAvatar(session?.user?.id, profile?.avatar_url);

  return (
    <div className="container py-6 space-y-6">
      <ProfileHeader profile={profile} session={session} />
      <ProfileTabs 
        profile={profile} 
        onTabChange={handleTabChange}
      />
    </div>
  );
}
