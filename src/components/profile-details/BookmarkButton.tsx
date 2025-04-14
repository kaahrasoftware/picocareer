import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface BookmarkButtonProps {
  profileId: string;
  session: any;
}

export function BookmarkButton({ profileId, session }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const { session: authSession } = useAuthSession();
  const queryClient = useQueryClient();

  // Don't render the button if the profile belongs to the current user
  if (authSession?.user?.id === profileId) {
    return null;
  }

  const handleBookmark = async () => {
    if (!authSession) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark profiles",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("user_bookmarks")
          .delete()
          .match({
            profile_id: authSession.user.id,
            content_type: "mentor",
            content_id: profileId,
          });

        if (error) throw error;

        setIsBookmarked(false);
        // Invalidate the bookmarks query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        
        toast({
          title: "Bookmark removed",
          description: "Profile has been removed from your bookmarks",
        });
      } else {
        // Add bookmark
        const { error } = await supabase.from("user_bookmarks").insert({
          profile_id: authSession.user.id,
          content_type: "mentor",
          content_id: profileId,
        });

        if (error) throw error;

        setIsBookmarked(true);
        // Invalidate the bookmarks query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
        
        toast({
          title: "Profile bookmarked",
          description: "Profile has been added to your bookmarks",
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    }
  };

  // Check if profile is bookmarked on component mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!authSession) return;

      try {
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select()
          .match({
            profile_id: authSession.user.id,
            content_type: "mentor",
            content_id: profileId,
          })
          .maybeSingle();

        if (error) throw error;
        setIsBookmarked(!!data);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };

    checkBookmarkStatus();
  }, [authSession, profileId]);

  return (
    <button
      onClick={handleBookmark}
      className="p-2 hover:bg-muted rounded-full transition-colors"
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Heart
        className={`h-5 w-5 ${
          isBookmarked ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
      />
    </button>
  );
}