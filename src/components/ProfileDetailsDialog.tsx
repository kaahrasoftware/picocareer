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
import { ProfileBio } from "./profile-details/ProfileBio";
import { ProfileSkills } from "./profile-details/ProfileSkills";
import { ProfileEducation } from "./profile-details/ProfileEducation";
import { ProfileLinks } from "./profile-details/ProfileLinks";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `)
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return {
        ...data,
        company_name: data.company?.name,
        school_name: data.school?.name,
        academic_major: data.academic_major?.title
      };
    },
    enabled: !!userId && open,
  });

  if (isLoading || !profile) {
    return null;
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
          <DialogHeader className="p-6 pb-0">
            <ProfileHeader profile={profile} />
          </DialogHeader>

          <ScrollArea className="h-[calc(85vh-120px)] px-6">
            <div className="space-y-6 pb-6">
              <ProfileBio bio={profile.bio} />
              <ProfileSkills skills={profile.skills} tools={profile.tools_used} />
              <ProfileEducation 
                academic_major={profile.academic_major} 
                highest_degree={profile.highest_degree}
              />
              <ProfileLinks 
                linkedin_url={profile.linkedin_url}
                github_url={profile.github_url}
                website_url={profile.website_url}
              />

              <div className="flex justify-center">
                <Button 
                  size="lg"
                  onClick={() => setBookingOpen(true)}
                  className="w-full md:w-auto"
                >
                  Book a Session
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <BookSessionDialog
        mentor={{
          id: userId,
          name: profile.full_name || '',
          imageUrl: profile.avatar_url || ''
        }}
        open={bookingOpen}
        onOpenChange={setBookingOpen}
      />
    </>
  );
}