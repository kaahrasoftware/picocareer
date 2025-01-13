import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuthSession } from "@/hooks/useAuthSession";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { SessionFeedbackDialog } from "@/components/feedback/SessionFeedbackDialog";
import { useFeedbackDialog } from "@/hooks/useFeedbackDialog";

export default function Profile() {
  const { id } = useParams();
  const { session } = useAuthSession();
  const { data: profile, isLoading } = useUserProfile(id || session?.user?.id);
  const { isOpen, sessionId, feedbackType, closeFeedbackDialog } = useFeedbackDialog();

  useEffect(() => {
    if (!profile) return;
    
    // Update page title
    document.title = `${profile.full_name || 'Profile'} | Lovable`;
  }, [profile]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader profile={profile} />
      <ProfileTabs profile={profile} />
      
      {sessionId && feedbackType && (
        <SessionFeedbackDialog
          sessionId={sessionId}
          isOpen={isOpen}
          onClose={closeFeedbackDialog}
          feedbackType={feedbackType}
          fromProfileId={session?.user?.id || ''}
          toProfileId={profile.id}
        />
      )}
    </div>
  );
}