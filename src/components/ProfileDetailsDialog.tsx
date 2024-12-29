import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileHeader } from "./profile-details/ProfileHeader";
import { ProfileEditForm } from "./profile-details/ProfileEditForm";
import { ProfileView } from "./profile-details/ProfileView";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      return user;
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
              <ProfileHeader profile={profile} />
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
                    onClick={() => setBookingOpen(true)}
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