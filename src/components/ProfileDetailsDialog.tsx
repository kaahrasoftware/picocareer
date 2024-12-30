import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { DialogHeader } from "./profile-details/DialogHeader";
import { ProfileView } from "./profile-details/ProfileView";
import { useProfileDetails } from "@/hooks/useProfileDetails";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const queryClient = useQueryClient();
  const { profile, isLoading, isOwnProfile, isMentor } = useProfileDetails(userId, open);

  // Subscribe to real-time changes
  useEffect(() => {
    if (!open || !userId) return;

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, open, queryClient]);

  if (isLoading || !profile) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader 
            profile={profile}
            isOwnProfile={isOwnProfile}
            isMentor={isMentor}
            onBookSession={() => setBookingOpen(true)}
          />

          <ScrollArea className="flex-1 px-6">
            <ProfileView profile={profile} />
          </ScrollArea>
        </DialogContent>
      </Dialog>

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