
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { Skeleton } from "@/components/ui/skeleton";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile, isLoading: profileLoading } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();
  const isMentor = profile?.user_type === "mentor";

  // Show loading skeleton while session or profile loads
  if (!session && profileLoading) {
    return (
      <div className="container py-6 space-y-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // Redirect to auth if no session after loading
  if (!session) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <p>Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <ProfileHeader profile={profile} session={session} />
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
