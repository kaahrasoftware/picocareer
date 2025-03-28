
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProfileAnalytics } from "@/hooks/useProfileAnalytics";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfileHeader } from "@/components/profile-details/ProfileHeader";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { handleTabChange } = useProfileAnalytics();
  const { toast } = useToast();
  const isMentor = profile?.user_type === "mentor";

  const handleShare = async () => {
    if (!profile) return;

    const shareUrl = `${window.location.origin}/mentor?dialog=true&profileId=${profile.id}`;
    const shareText = `Check out ${profile.full_name}'s profile!\n\n${profile.bio || ''}\n\nLocation: ${profile.location || 'Not specified'}\nExperience: ${profile.years_of_experience || 0} years\n\nLearn more at:`;
    const imageUrl = profile.avatar_url || '';

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${profile.full_name}'s Profile`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        const fullText = `${shareText} ${shareUrl}`;
        navigator.clipboard.writeText(fullText);
        toast({
          title: "Success",
          description: "Profile details copied to clipboard!",
        });
      }
    } catch (error) {
      console.error("Error sharing profile:", error);
      if ((error as Error).name !== 'AbortError') {
        toast({
          title: "Error",
          description: "Failed to share profile",
          variant: "destructive",
        });
      }
    }
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
