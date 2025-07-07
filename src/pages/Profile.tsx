
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { useDefaultAvatar } from "@/hooks/useDefaultAvatar";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { PageLoader } from "@/components/ui/page-loader";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile, isLoading, error } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();

  // Ensure user has a default avatar if they don't have one
  useDefaultAvatar(session?.user?.id, profile?.avatar_url);

  // Show loading state while profile data is being fetched
  if (isLoading) {
    return (
      <div className="container py-6">
        <PageLoader isLoading={true} variant="default" />
      </div>
    );
  }

  // Show error state if profile fetch failed
  if (error) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Failed to load profile data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render components if profile is still null/undefined
  if (!profile) {
    return (
      <div className="container py-6">
        <div className="text-center py-8">
          <p className="text-muted-foreground">No profile data available</p>
        </div>
      </div>
    );
  }

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
