import { useAuthSession } from '@/hooks/useAuthSession';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from '@/hooks/useDebounce';
import { useCallback } from 'react';

interface InteractionData {
  elementId: string;
  elementType: string;
  interactionType: 'click' | 'search' | 'bookmark' | 'content_view' | 'page_view';
  pagePath: string;
  interactionData?: any;
}

export function useAnalytics() {
  const { session } = useAuthSession();

  const trackInteractionImpl = useCallback(async (data: InteractionData) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          profile_id: session.user.id,
          interaction_type: data.interactionType,
          element_id: data.elementId,
          element_type: data.elementType,
          page_path: data.pagePath,
          interaction_data: data.interactionData,
        });

      if (error) {
        console.error('Error tracking interaction:', error);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }, [session?.user?.id]);

  const trackInteraction = useDebounce(trackInteractionImpl, 1000);

  const trackPageView = useCallback(async (pagePath: string) => {
    if (!session?.user?.id) return;

    try {
      const { data: existingView } = await supabase
        .from('user_page_views')
        .select('id, entry_time')
        .eq('profile_id', session.user.id)
        .eq('page_path', pagePath)
        .is('exit_time', null)
        .maybeSingle();

      if (!existingView) {
        const { error } = await supabase
          .from('user_page_views')
          .insert({
            profile_id: session.user.id,
            page_path: pagePath,
          });

        if (error) {
          console.error('Error tracking page view:', error);
        }
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }, [session?.user?.id]);

  const trackContentEngagement = useCallback(async (
    contentType: string,
    contentId: string,
    timeSpent: number,
    scrollDepth?: number
  ) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('content_engagement')
        .insert({
          profile_id: session.user.id,
          content_type: contentType,
          content_id: contentId,
          time_spent: timeSpent,
          scroll_depth: scrollDepth,
        });

      if (error) {
        console.error('Error tracking content engagement:', error);
      }
    } catch (error) {
      console.error('Error tracking content engagement:', error);
    }
  }, [session?.user?.id]);

  const updatePageViewExit = useCallback(async (pagePath: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('user_page_views')
        .update({ exit_time: new Date().toISOString() })
        .eq('profile_id', session.user.id)
        .eq('page_path', pagePath)
        .is('exit_time', null);

      if (error) {
        console.error('Error updating page view exit time:', error);
      }
    } catch (error) {
      console.error('Error updating page view exit time:', error);
    }
  }, [session?.user?.id]);

  return {
    trackPageView,
    trackInteraction,
    trackContentEngagement,
    updatePageViewExit,
  };
}