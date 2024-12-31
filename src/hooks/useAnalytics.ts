import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useDebounce } from '@/hooks/useDebounce';

interface InteractionData {
  elementId: string;
  elementType: string;
  interactionType: 'click' | 'search' | 'bookmark' | 'content_view' | 'page_view';
  pagePath: string;
  interactionData?: any;
}

export function useAnalytics() {
  const { session } = useAuthSession();
  const debouncedTrackInteraction = useDebounce((data: InteractionData) => trackInteraction(data), 1000);

  const trackPageView = async (pagePath: string) => {
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
  };

  const trackInteraction = async ({
    elementId,
    elementType,
    interactionType,
    pagePath,
    interactionData
  }: InteractionData) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('user_interactions')
        .insert({
          profile_id: session.user.id,
          interaction_type: interactionType,
          element_id: elementId,
          element_type: elementType,
          page_path: pagePath,
          interaction_data: interactionData,
        });

      if (error) {
        console.error('Error tracking interaction:', error);
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  };

  const trackContentEngagement = async (
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
  };

  const updatePageViewExit = async (pagePath: string) => {
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
  };

  return {
    trackPageView,
    trackInteraction: debouncedTrackInteraction,
    trackContentEngagement,
    updatePageViewExit,
  };
}