
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();
  const isMentor = profile?.user_type === "mentor";

  const handleShare = () => {
    // You can implement share functionality here if needed
    console.log("Share profile functionality would be implemented here");
  };

  return (
    <div className="container py-6 space-y-6">
      <ProfileHeader profile={profile} session={session} onShare={handleShare} />
      <div className="grid w-full grid-cols-5 mb-6">
        <ProfileTabs 
          profile={profile} 
          isMentor={isMentor} 
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}
