import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
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
  const { currentUser, profile, isLoading } = useProfileDetailsData(userId, open, session);

  // Calculate these values after hooks
  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile?.user_type === 'mentor';
  const isApprovedMentor = isMentor && profile?.onboarding_status === 'Approved';

  // Handle authentication errors
  if (sessionError) {
    // Clear all auth-related data
    const key = `sb-${process.env.VITE_SUPABASE_PROJECT_ID}-auth-token`;
    localStorage.removeItem(key);
    queryClient.clear();
    
    toast({
      title: "Authentication Error",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
    
    navigate("/auth");
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Return early if no profile or if mentor is not approved
  if (!profile) {
    return null;
  }

  // If the profile is a mentor and not approved, only show to the profile owner
  if (isMentor && !isApprovedMentor && !isOwnProfile) {
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

      {!isOwnProfile && isApprovedMentor && (
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