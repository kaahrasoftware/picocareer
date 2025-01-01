import { Dialog } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileDialogContent } from "./profile-details/ProfileDialogContent";
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

  const handleAuthError = async (error: any) => {
    console.error('Authentication error:', error);
    
    // Clear any stale session data
    await supabase.auth.signOut();
    queryClient.clear();
    
    toast({
      title: "Session expired",
      description: "Please sign in again to continue.",
      variant: "destructive",
    });
    
    navigate("/auth");
    return null;
  };

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          if (error.message.includes('session_not_found') || 
              error.message.includes('refresh_token_not_found') ||
              error.message.includes('Invalid Refresh Token')) {
            console.log('Session expired or invalid, redirecting to auth page');
            return handleAuthError(error);
          }
          throw error;
        }
        
        return user;
      } catch (error) {
        console.error('Error fetching current user:', error);
        return handleAuthError(error);
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
  });

  const { data: session } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          if (error.message.includes('session_not_found') || 
              error.message.includes('refresh_token_not_found') ||
              error.message.includes('Invalid Refresh Token')) {
            return handleAuthError(error);
          }
          throw error;
        }
        return session;
      } catch (error) {
        console.error('Error fetching session:', error);
        return handleAuthError(error);
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
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
    enabled: !!userId && open && !!session,
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