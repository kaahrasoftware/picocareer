import { Dialog } from "@/components/ui/dialog";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDialogContent } from "./profile-details/ProfileDialogContent";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useProfileSession } from "@/hooks/useProfileSession";
import { useProfileDetailsData } from "@/hooks/useProfileDetailsData";
import { ProfileRealtime } from "./profile-details/ProfileRealtime";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  // Move all hooks to the top level
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, sessionError, queryClient } = useProfileSession();
  const { currentUser, profile, isLoading } = useProfileDetailsData(userId, open, session);

  // Calculate these values after hooks
  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile?.user_type === 'mentor';

  // Handle authentication errors
  if (sessionError) {
    // Clear all auth-related data
    const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    localStorage.removeItem(key);
    queryClient.clear();
    
    // Show error message and navigate
    toast({
      title: "Authentication Error",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
    
    navigate("/auth");
    return null;
  }

  const handleBookSession = () => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to book a session.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    setBookingOpen(true);
  };

  // Return loading state instead of null
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Return error state if no profile
  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <ProfileDialogContent
          profile={profile}
          session={session}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isOwnProfile={isOwnProfile}
          isMentor={isMentor}
          handleBookSession={handleBookSession}
        />
      </Dialog>

      <ProfileRealtime 
        userId={userId}
        open={open}
        session={session}
        queryClient={queryClient}
      />

      {!isOwnProfile && (
        <BookSessionDialog
          mentor={{
            id: userId,
            name: profile.full_name || '',
            imageUrl: profile.avatar_url || ''
          }}
          open={bookingOpen}
          onOpenChange={setBookingOpen}
        />
      )}
    </>
  );
}