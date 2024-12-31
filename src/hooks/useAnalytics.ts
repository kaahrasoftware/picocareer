import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';

export function useAnalytics() {
  const { session } = useAuthSession();

  const trackPageView = async (pagePath: string) => {
    if (!session?.user?.id) return;

    try {
      const { error } = await supabase
        .from('user_page_views')
        .insert({
          profile_id: session.user.id,
          page_path: pagePath,
        });

      if (error) {
        console.error('Error tracking page view:', error);
      }
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  };

  const trackInteraction = async (
    elementId: string,
    elementType: string,
    interactionType: 'click' | 'search' | 'bookmark' | 'content_view' | 'page_view',
    pagePath: string,
    interactionData?: any
  ) => {
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

  return {
    trackPageView,
    trackInteraction,
    trackContentEngagement,
  };
}