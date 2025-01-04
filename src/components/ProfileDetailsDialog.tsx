import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDialogContent } from "./profile-details/ProfileDialogContent";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useProfileSession } from "@/hooks/useProfileSession";
import { PointerDownOutsideEvent } from "@radix-ui/react-dialog";

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

  // Only fetch user data if we have a valid session
  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        console.log('Fetching current user data...');
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error fetching user:', error);
          throw error;
        }
        
        console.log('Current user data fetched successfully');
        return user;
      } catch (error: any) {
        console.error('Detailed user fetch error:', error);
        throw error;
      }
    },
    retry: false,
    enabled: !!session, // Only run if we have a session
  });

  // Only fetch profile if we have a session and the dialog is open
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      try {
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

        console.log('Profile data fetched successfully:', data);
        
        return {
          ...data,
          company_name: data.company?.name,
          school_name: data.school?.name,
          academic_major: data.academic_major?.title,
          career_title: data.career?.title,
          career_id: data.career?.id
        };
      } catch (error: any) {
        console.error('Detailed profile fetch error:', error);
        throw error;
      }
    },
    enabled: !!userId && open && !!session,
    retry: 1,
  });

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

  // Subscribe to real-time changes
  useEffect(() => {
    if (!open || !userId || !session) return;

    console.log('Setting up real-time subscription for profile:', userId);

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
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, open, queryClient, session]);

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

  const handlePointerDownOutside = (e: PointerDownOutsideEvent) => {
    e.preventDefault();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onOpenChange={onOpenChange}
        modal={true}
      >
        <ProfileDialogContent
          profile={profile}
          session={session}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          isOwnProfile={isOwnProfile}
          isMentor={isMentor}
          handleBookSession={handleBookSession}
          onPointerDownOutside={handlePointerDownOutside}
        />
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