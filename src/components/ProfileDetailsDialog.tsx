import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileHeader } from "./profile-details/ProfileHeader";
import { ProfileEditForm } from "./profile-details/ProfileEditForm";
import { ProfileView } from "./profile-details/ProfileView";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          if (error.message.includes('session_not_found')) {
            console.log('Session expired, redirecting to auth page');
            toast({
              title: "Session expired",
              description: "Please sign in again to continue.",
              variant: "destructive",
            });
            navigate("/auth");
            return null;
          }
          throw error;
        }
        
        return user;
      } catch (error) {
        console.error('Error fetching current user:', error);
        throw error;
      }
    },
    retry: false
  });

  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    },
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title),
          career:careers!profiles_position_fkey(title, id)
        `)
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Fetched profile data:', data);
      
      return {
        ...data,
        company_name: data.company?.name,
        school_name: data.school?.name,
        academic_major: data.academic_major?.title,
        career_title: data.career?.title,
        career_id: data.career?.id
      };
    },
    enabled: !!userId && open,
  });

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
          // Invalidate and refetch the profile query
          queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, open, queryClient]);

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

  if (isLoading || !profile) {
    return null;
  }

  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile.user_type === 'mentor';

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl h-[85vh] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader className="p-6 pb-0">
            <div className="relative">
              <ProfileHeader profile={profile} session={session} />
              {isMentor && (
                isOwnProfile ? (
                  <Button 
                    size="lg"
                    onClick={() => setIsEditing(!isEditing)}
                    className="absolute right-0 top-16"
                  >
                    {isEditing ? "Cancel Editing" : "Edit Profile"}
                  </Button>
                ) : (
                  <Button 
                    size="lg"
                    onClick={handleBookSession}
                    className="absolute right-0 top-16"
                  >
                    Book a Session
                  </Button>
                )
              )}
            </div>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            {isEditing ? (
              <ProfileEditForm 
                profile={profile} 
                onCancel={() => setIsEditing(false)}
                onSuccess={() => setIsEditing(false)}
              />
            ) : (
              <ProfileView profile={profile} />
            )}
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
