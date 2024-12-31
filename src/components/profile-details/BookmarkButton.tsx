import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface BookmarkButtonProps {
  profileId: string;
  session: Session | null;
}

export function BookmarkButton({ profileId, session }: BookmarkButtonProps) {
  const [isBookmarking, setIsBookmarking] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: isBookmarked } = useQuery({
    queryKey: ['bookmark', profileId, session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id || !profileId) return false;
      
      try {
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select('id')
          .eq('profile_id', session.user.id)
          .eq('content_id', profileId)
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
    enabled: !!session?.user?.id && !!profileId,
  });

  const handleBookmarkClick = async () => {
    if (!session?.user?.id || !profileId || isBookmarking) return;

    setIsBookmarking(true);
    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_id', profileId)
          .eq('content_type', 'mentor');

        if (error) throw error;

        toast({
          title: "Bookmark removed",
          description: "Mentor removed from your bookmarks",
        });
      } else {
        const { error } = await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_id: profileId,
            content_type: 'mentor'
          });

        if (error) throw error;

        toast({
          title: "Bookmarked",
          description: "Mentor added to your bookmarks",
        });
      }

      queryClient.invalidateQueries({ queryKey: ['bookmark', profileId, session.user.id] });
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

  if (!session?.user?.id || session.user.id === profileId) return null;

  return (
    <button
      onClick={handleBookmarkClick}
      disabled={isBookmarking}
      className="ml-auto p-2 hover:bg-muted rounded-full transition-colors"
      aria-label={isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
    >
      <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
    </button>
  );
}