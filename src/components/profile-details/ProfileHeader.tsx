import { Badge } from "@/components/ui/badge";
import { Building2, GraduationCap, Award, MapPin, Bookmark } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

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
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
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

      // Invalidate and refetch profile data
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

  // Check if the current user has bookmarked this profile
  const { data: isBookmarked } = useQuery({
    queryKey: ['bookmark', profile.id, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !profile?.id) return false;
      
      try {
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('id')
          .eq('profile_id', session.user.id)
          .eq('content_id', profile.id)
          .eq('content_type', 'mentor')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking bookmark:', error);
          return false;
        }

        return !!data;
      } catch (error) {
        console.error('Error in bookmark query:', error);
        return false;
      }
    },
    enabled: !!session?.user?.id && !!profile?.id,
  });

  const handleBookmarkClick = async () => {
    if (!session?.user?.id || !profile?.id || isBookmarking) return;

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_id', profile.id)
          .eq('content_type', 'mentor');

        if (error) throw error;

        toast({
          title: "Bookmark removed",
          description: "Mentor removed from your bookmarks",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_id: profile.id,
            content_type: 'mentor'
          });

        if (error) throw error;

        toast({
          title: "Bookmarked",
          description: "Mentor added to your bookmarks",
        });
      }

      // Invalidate the bookmark query to refresh the state
      queryClient.invalidateQueries({ queryKey: ['bookmark', profile.id, session.user.id] });
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    } finally {
      setIsBookmarking(false);
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
          {session?.user?.id && session.user.id !== profile.id && (
            <button
              onClick={handleBookmarkClick}
              disabled={isBookmarking}
              className="ml-auto p-2 hover:bg-muted rounded-full transition-colors"
              aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
            >
              <Bookmark 
                className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`}
              />
            </button>
          )}
        </div>
        <div className="flex flex-col gap-1 mt-2">
          {profile.career_title && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-4 w-4 flex-shrink-0" />
              <span>{profile.company_name || "No company set"}</span>
            </div>
          )}
          {profile.school_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span>{profile.school_name}</span>
            </div>
          )}
          {profile.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span>{profile.location}</span>
            </div>
          )}
          {profile.academic_major && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
              <span>{profile.academic_major}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
