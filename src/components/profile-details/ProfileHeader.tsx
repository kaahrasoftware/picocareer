import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    career: { title: string; id: string } | null;
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    location?: string | null;
    top_mentor?: boolean | null;
    user_type?: string | null;
    position?: string | null;
    academic_major_id?: string | null;
    school_id?: string | null;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { toast } = useToast();

  // Fetch additional profile details
  const { data: profileDetails } = useQuery({
    queryKey: ['profileDetails', profile.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          career:careers!profiles_position_fkey(title),
          school:schools!profiles_school_id_fkey(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `)
        .eq('id', profile.id)
        .single();

      if (error) {
        console.error('Error fetching profile details:', error);
        toast({
          title: "Error",
          description: "Failed to fetch profile details",
          variant: "destructive",
        });
        return null;
      }

      return data;
    },
    enabled: !!profile.id,
  });
  
  if (!profile) return null;

  const isMentee = profile.user_type === 'mentee';

  // Determine primary and secondary display text based on whether the user is a student or professional
  const primaryText = !isMentee ? (profileDetails?.career?.title || 
                     profileDetails?.academic_major?.title || 
                     "No position/major set") : null;
                     
  const secondaryText = !isMentee ? (profileDetails?.career?.title 
    ? profileDetails?.school?.name || "No company set"
    : profileDetails?.school?.name || "No school set") : null;

  const handleAvatarUpdate = async (blob: Blob) => {
    try {
      const fileExt = 'jpg';
      const filePath = `${profile.id}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });

    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-6 ml-6">
      <ProfileAvatar 
        profile={profile} 
        onAvatarUpdate={handleAvatarUpdate}
      />

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-2xl font-bold">{profile.full_name}</h2>
          {profile.user_type === 'mentor' && (
            profile.top_mentor ? (
              <Badge className="bg-primary/20 text-primary hover:bg-primary/30 flex items-center gap-1">
                <Award className="h-3 w-3" />
                Top Mentor
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">
                mentor
              </Badge>
            )
          )}
        </div>
        {primaryText && (
          <p className="text-lg font-medium text-foreground/90">{primaryText}</p>
        )}
        <div className="flex flex-col gap-1 mt-2">
          {!isMentee && profileDetails?.career?.title ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>{secondaryText}</span>
            </div>
          ) : profileDetails?.school?.name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span>{profileDetails.school.name}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
          {!isMentee && profileDetails?.academic_major?.title && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span>{profileDetails.academic_major.title}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}