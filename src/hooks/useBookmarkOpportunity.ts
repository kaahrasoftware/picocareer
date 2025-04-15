
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';

export function useBookmarkOpportunity(opportunityId?: string) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Check if the opportunity is bookmarked
  const { data: bookmark, isLoading: checkingBookmark } = useQuery({
    queryKey: ['bookmark', opportunityId, profile?.id],
    queryFn: async () => {
      if (!opportunityId || !profile?.id) return null;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('content_id', opportunityId)
        .eq('profile_id', profile.id)
        .eq('content_type', 'opportunity')
        .maybeSingle();

      if (error) {
        console.error('Error checking bookmark:', error);
        return null;
      }

      return data;
    },
    enabled: !!opportunityId && !!profile?.id,
  });

  useEffect(() => {
    setIsBookmarked(!!bookmark);
  }, [bookmark]);

  const addBookmark = async () => {
    if (!opportunityId || !profile?.id) {
      throw new Error('User or opportunity not found');
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        content_id: opportunityId,
        profile_id: profile.id,
        content_type: 'opportunity',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error adding bookmark: ${error.message}`);
    }

    // Update the bookmarks count for the opportunity
    try {
      const { data: opportunity } = await supabase
        .from('opportunities')
        .select('bookmarks_count')
        .eq('id', opportunityId)
        .single();

      await supabase
        .from('opportunities')
        .update({ bookmarks_count: (opportunity.bookmarks_count || 0) + 1 })
        .eq('id', opportunityId);
    } catch (updateError) {
      console.error('Failed to update bookmarks count:', updateError);
    }

    return data;
  };

  const removeBookmark = async () => {
    if (!opportunityId || !profile?.id) {
      throw new Error('User or opportunity not found');
    }

    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('content_id', opportunityId)
      .eq('profile_id', profile.id)
      .eq('content_type', 'opportunity');

    if (error) {
      throw new Error(`Error removing bookmark: ${error.message}`);
    }

    // Update the bookmarks count for the opportunity
    try {
      const { data: opportunity } = await supabase
        .from('opportunities')
        .select('bookmarks_count')
        .eq('id', opportunityId)
        .single();

      await supabase
        .from('opportunities')
        .update({
          bookmarks_count: Math.max((opportunity.bookmarks_count || 0) - 1, 0),
        })
        .eq('id', opportunityId);
    } catch (updateError) {
      console.error('Failed to update bookmarks count:', updateError);
    }

    return true;
  };

  const addMutation = useMutation({
    mutationFn: addBookmark,
    onSuccess: () => {
      setIsBookmarked(true);
      queryClient.invalidateQueries({ queryKey: ['bookmark', opportunityId, profile?.id] });
      toast({
        title: 'Bookmark Added',
        description: 'Opportunity added to your bookmarks',
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

  const removeMutation = useMutation({
    mutationFn: removeBookmark,
    onSuccess: () => {
      setIsBookmarked(false);
      queryClient.invalidateQueries({ queryKey: ['bookmark', opportunityId, profile?.id] });
      toast({
        title: 'Bookmark Removed',
        description: 'Opportunity removed from your bookmarks',
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

  const toggleBookmark = () => {
    if (!session) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to bookmark this opportunity',
        variant: 'destructive',
      });
      return;
    }

    if (isBookmarked) {
      removeMutation.mutate();
    } else {
      addMutation.mutate();
    }
  };

  return {
    isBookmarked,
    toggleBookmark,
    isLoading: addMutation.isPending || removeMutation.isPending || checkingBookmark,
  };
}
