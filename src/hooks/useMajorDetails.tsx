
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { Major } from "@/types/database/majors";

export function useMajorDetails(major: Major, open: boolean) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  // Fetch major with related careers data
  const { data: majorWithCareers, isError } = useQuery({
    queryKey: ['major-careers', major.id],
    queryFn: async () => {
      console.log("Fetching major data for ID:", major.id);
      
      const { data, error } = await supabase
        .from('majors')
        .select(`
          *,
          career_major_relations(
            career:careers(id, title, salary_range)
          )
        `)
        .eq('id', major.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching major data:", error);
        throw error;
      }

      if (!data) {
        console.log("No major found with ID:", major.id);
        return null;
      }

      console.log("Fetched major data:", data);
      return data as Major;
    },
    enabled: open && !!major.id,
  });

  // Check if the major is bookmarked
  useQuery({
    queryKey: ['major-bookmark', major.id, session?.user.id],
    queryFn: async () => {
      if (!session?.user.id) return null;
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('content_type', 'major')
        .eq('content_id', major.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking bookmark status:", error);
        throw error;
      }

      setIsBookmarked(!!data);
      return data;
    },
    enabled: open && !!major.id && !!session?.user.id,
  });

  // Toggle bookmark functionality
  const handleBookmarkToggle = async () => {
    if (!session?.user.id) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark majors",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isBookmarked) {
        await supabase
          .from('user_bookmarks')
          .delete()
          .eq('profile_id', session.user.id)
          .eq('content_type', 'major')
          .eq('content_id', major.id);
      } else {
        await supabase
          .from('user_bookmarks')
          .insert({
            profile_id: session.user.id,
            content_type: 'major',
            content_id: major.id,
          });
      }
      
      setIsBookmarked(!isBookmarked);
      toast({
        title: isBookmarked ? "Major unbookmarked" : "Major bookmarked",
        description: isBookmarked ? "Major removed from your bookmarks" : "Major added to your bookmarks",
      });
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark",
        variant: "destructive",
      });
    }
  };

  return {
    majorWithCareers,
    isError,
    isBookmarked,
    handleBookmarkToggle
  };
}
