import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { BookSessionDialog } from "./BookSessionDialog";
import { ProfileHeader } from "./profile-details/ProfileHeader";
import { ProfileBio } from "./profile-details/ProfileBio";
import { ProfileSkills } from "./profile-details/ProfileSkills";
import { ProfileEducation } from "./profile-details/ProfileEducation";
import { ProfileLinks } from "./profile-details/ProfileLinks";
import { useNavigate } from "react-router-dom";
import { ProfileKeywords } from "./profile-details/ProfileKeywords";
import { ProfileFieldsOfInterest } from "./profile-details/ProfileFieldsOfInterest";
import { Button } from "@/components/ui/button";
import type { ProfileDetails } from "@/types/profile";

interface ProfileDetailsDialogProps {
  userId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDetailsDialog({ userId, open, onOpenChange }: ProfileDetailsDialogProps) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const navigate = useNavigate();

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
          id,
          first_name,
          last_name,
          avatar_url,
          bio,
          email,
          position,
          company_id,
          school_id,
          years_of_experience,
          skills,
          tools_used,
          keywords,
          fields_of_interest,
          linkedin_url,
          github_url,
          website_url,
          highest_degree,
          academic_major_id,
          location,
          user_type,
          company:companies(id, name),
          school:schools(name),
          academic_major:majors(title),
          career:careers!profiles_position_fkey(title, id)
        `)
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Fetched profile data:', data);
      
      if (!data) return null;

      // Construct the full name from first and last name
      const fullName = [data.first_name, data.last_name]
        .filter(Boolean)
        .join(' ') || null;

      return {
        ...data,
        full_name: fullName,
        company_id: data.company?.id,
        company_name: data.company?.name,
        school_name: data.school?.name,
        academic_major: data.academic_major?.title,
        career_title: data.career?.title,
        career_id: data.career?.id
      } as ProfileDetails;
    },
    enabled: !!userId && open,
  });

  if (isLoading || !profile) {
    return null;
  }

  const isOwnProfile = currentUser?.id === userId;
  const isMentor = profile.user_type === 'mentor';

  const handleEditProfile = () => {
    onOpenChange(false);
    navigate('/profile');
  };

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
                    onClick={handleEditProfile}
                    className="absolute right-0 top-16"
                  >
                    Edit Mentor Profile
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
            <div className="space-y-6 pb-6">
              <ProfileBio bio={profile.bio} profileId={profile.id} />
              <ProfileKeywords keywords={profile.keywords} />
              <ProfileFieldsOfInterest fields={profile.fields_of_interest} />
              <ProfileSkills skills={profile.skills} tools={profile.tools_used} />
              <ProfileEducation 
                academic_major={profile.academic_major} 
                highest_degree={profile.highest_degree}
                school_name={profile.school_name}
                profileId={profile.id}
              />
              <ProfileLinks 
                linkedin_url={profile.linkedin_url}
                github_url={profile.github_url}
                website_url={profile.website_url}
              />
            </div>
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