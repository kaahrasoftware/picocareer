import { Dialog } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDialogContent } from "./profile-details/ProfileDialogContent";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useProfileSession } from "@/hooks/useProfileSession";
import { useProfileDetailsData } from "@/hooks/useProfileDetailsData";
import { ProfileRealtime } from "./profile-details/ProfileRealtime";
import { Skeleton } from "./ui/skeleton";

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
  const { currentUser, profile, isLoading, isError } = useProfileDetailsData(userId, open, session);

  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile?.user_type === 'mentor';

  useEffect(() => {
    if (sessionError) {
      const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
      localStorage.removeItem(key);
      queryClient.clear();
      
      toast({
        title: "Authentication Error",
        description: "Please sign in again to continue.",
        variant: "destructive",
      });
      
      navigate("/auth");
    }
  }, [sessionError, queryClient, toast, navigate]);

  useEffect(() => {
    if (isError && open) {
      toast({
        title: "Error",
        description: "Could not load mentor profile. Please try again later.",
        variant: "destructive",
      });
      onOpenChange(false);
    }
  }, [isError, open, toast, onOpenChange]);

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-background p-6 rounded-lg w-full max-w-2xl">
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </Dialog>
    );
  }

  // Don't render anything if there's no profile
  if (!profile) {
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

  function handleBookSession() {
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
  }
}
