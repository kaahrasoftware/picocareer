import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
              
              {/* Keywords Section */}
              {profile.keywords && profile.keywords.length > 0 && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.keywords.map((keyword, index) => (
                      <Badge 
                        key={index}
                        className="bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
                      >
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Fields of Interest Section */}
              {profile.fields_of_interest && profile.fields_of_interest.length > 0 && (
                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Fields of Interest</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.fields_of_interest.map((field, index) => (
                      <Badge 
                        key={index}
                        className="bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
                      >
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

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