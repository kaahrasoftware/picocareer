
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";

export function useBookmarkOpportunity(opportunityId?: string) {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Check if already bookmarked
  const { data: isBookmarked, refetch } = useQuery({
    queryKey: ['opportunity-bookmark', opportunityId, session?.user?.id],
    queryFn: async () => {
      if (!opportunityId || !session?.user?.id) return false;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('id')
        .eq('content_id', opportunityId)
        .eq('content_type', 'opportunity')
        .eq('profile_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error("Error checking bookmark:", error);
      }

      return !!data;
    },
    enabled: !!opportunityId && !!session?.user?.id,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!opportunityId || !session?.user?.id) {
        throw new Error("You must be logged in to bookmark opportunities");
      }

      setIsLoading(true);

      try {
        if (isBookmarked) {
          // Remove bookmark
          const { error } = await supabase
            .from('user_bookmarks')
            .delete()
            .eq('content_id', opportunityId)
            .eq('content_type', 'opportunity')
            .eq('profile_id', session.user.id);

          if (error) throw error;

          // Decrement bookmark count in analytics
          await updateBookmarkCount(opportunityId, -1);

          return { action: 'removed' };
        } else {
          // Add bookmark
          const { error } = await supabase
            .from('user_bookmarks')
            .insert({
              content_id: opportunityId,
              content_type: 'opportunity',
              profile_id: session.user.id
            });

          if (error) throw error;

          // Increment bookmark count in analytics
          await updateBookmarkCount(opportunityId, 1);

          return { action: 'added' };
        }
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: (data) => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['opportunity', opportunityId] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      
      toast({
        title: data.action === 'added' ? 'Bookmarked' : 'Bookmark removed',
        description: data.action === 'added' 
          ? 'Opportunity added to your bookmarks' 
          : 'Opportunity removed from your bookmarks',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Helper function to update bookmark count
  const updateBookmarkCount = async (id: string, change: number) => {
    // First get the analytics record
    const { data, error } = await supabase
      .from('opportunity_analytics')
      .select('id, bookmarks_count')
      .eq('opportunity_id', id)
      .single();

    if (error) {
      console.error("Error fetching analytics for bookmark update:", error);
      return;
    }

    // Update the count
    if (data) {
      const newCount = Math.max(0, (data.bookmarks_count || 0) + change);
      await supabase
        .from('opportunity_analytics')
        .update({ bookmarks_count: newCount })
        .eq('id', data.id);
    } else {
      // Create analytics record if it doesn't exist
      await supabase
        .from('opportunity_analytics')
        .insert({
          opportunity_id: id,
          bookmarks_count: Math.max(0, change),
          views_count: 0,
          applications_count: 0
        });
    }
  };

  const toggleBookmark = () => toggleMutation.mutate();

  return {
    isBookmarked: !!isBookmarked,
    toggleBookmark,
    isLoading,
  };
}
