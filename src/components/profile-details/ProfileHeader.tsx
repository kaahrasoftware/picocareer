import { Badge } from "@/components/ui/badge";
import { Award } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { BookmarkButton } from "./BookmarkButton";
import { ProfileInfo } from "./ProfileInfo";
import type { Session } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  profile: {
    id: string;
    avatar_url: string | null;
    full_name: string | null;
    user_type?: string | null;
    top_mentor?: boolean | null;
    career_title?: string | null;
    school_name?: string | null;
    company_name?: string | null;
    location?: string | null;
    academic_major?: string | null;
  } | null;
  session: Session | null;
}

export function ProfileHeader({ profile, session }: ProfileHeaderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  if (!profile) return null;

  const handleAvatarUpdate = async (url: string) => {
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      queryClient.invalidateQueries({ queryKey: ['profile', profile.id] });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile picture",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex items-center gap-6 ml-6">
      <ProfileAvatar 
        avatarUrl={profile.avatar_url}
        fallback={profile.full_name?.[0] || 'U'}
        size="lg"
        editable={true}
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
          <BookmarkButton profileId={profile.id} session={session} />
        </div>
        <ProfileInfo 
          careerTitle={profile.career_title}
          companyName={profile.company_name}
          schoolName={profile.school_name}
          location={profile.location}
          academicMajor={profile.academic_major}
        />
      </div>
    </div>
  );
}