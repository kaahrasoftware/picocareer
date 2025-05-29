
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();

  return (
    <div className="container py-6 space-y-6">
      <ProfileHeader profile={profile} session={session} />
      <ProfileTabs profileId={session?.user?.id} />
    </div>
  );
}
