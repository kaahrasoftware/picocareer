import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin } from "lucide-react";
import { ProfileAvatar } from "./ProfileAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { toast } = useToast();
  
  if (!profile) return null;

  // Determine primary and secondary display text based on whether the user is a student or professional
  const primaryText = profile.career?.title || profile.academic_major || "No position/major set";
  const secondaryText = profile.career?.title 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  const handleAvatarUpdate = async (blob: Blob) => {
    try {
      const fileExt = 'jpg'; // Since we're converting to JPEG in the image processing
      const filePath = `${profile.id}.${fileExt}`;

      // Upload the blob to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, { upsert: true });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update the profile with the new avatar URL
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
        <p className="text-lg font-medium text-foreground/90">{primaryText}</p>
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            {profile.career?.title ? (
              <Building2 className="h-4 w-4 flex-shrink-0" />
            ) : (
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
            )}
            <span>{secondaryText}</span>
          </div>
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}