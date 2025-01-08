import { Dialog } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, sessionError, queryClient } = useProfileSession();
  const { currentUser, profile, isLoading } = useProfileDetailsData(userId, open, session);

  // Handle authentication errors
  useEffect(() => {
    if (sessionError) {
      console.log('Session error detected, cleaning up...');
      
      // Clear all auth-related data
      const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
      localStorage.removeItem(key);
      queryClient.clear();
      
      // Show error message
      toast({
        title: "Authentication Error",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      
      // Navigate to auth page
      navigate("/auth");
    }
  }, [sessionError, navigate, queryClient, toast]);

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

  // Move the loading check after all hooks
  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile?.user_type === 'mentor';

  // Return null only after all hooks have been called
  if (isLoading || !profile) {
    return null;
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