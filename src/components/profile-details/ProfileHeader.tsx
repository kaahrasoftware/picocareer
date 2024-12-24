import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { ProfileAvatar } from "./ProfileAvatar";
import type { Profile } from "@/types/database/profiles";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    position: string | null;
    company_name?: string | null;
    school_name?: string | null;
    academic_major?: string | null;
    location?: string | null;
    top_mentor?: boolean | null;
    user_type?: string | null;
    career_title?: string | null;
  } | null;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!profile) return null;

  // Determine primary and secondary display text based on whether the user is a student or professional
  const primaryText = profile.career_title || profile.academic_major || "No position/major set";
  const secondaryText = profile.career_title 
    ? profile.company_name || "No company set"
    : profile.school_name || "No school set";

  const handleAvatarUpdate = async (croppedBlob: Blob) => {
    try {
      setUploading(true);

      const fileName = `avatar.jpg`;
      const filePath = `${profile.id}/${fileName}`;

      // Delete old avatar if it exists
      if (profile.avatar_url) {
        try {
          const oldFilePath = profile.avatar_url.split('/').slice(-2).join('/');
          if (oldFilePath) {
            await supabase.storage
              .from('avatars')
              .remove([oldFilePath]);
          }
        } catch (deleteError) {
          console.error('Error deleting old avatar:', deleteError);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, { 
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Update the profile data in the cache
      const currentProfile = queryClient.getQueryData(['profile']);
      if (currentProfile && typeof currentProfile === 'object') {
        queryClient.setQueryData(['profile'], {
          ...(currentProfile as object),
          avatar_url: publicUrl
        });
      }

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      console.error('Error uploading avatar:', error);
    } finally {
      setUploading(false);
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
            {profile.career_title ? (
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