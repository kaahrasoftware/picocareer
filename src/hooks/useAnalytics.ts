import { useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";
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

  const trackInteraction = useCallback((data: InteractionData) => {
    const debouncedFn = useDebounce(trackInteractionImpl, 1000);
    debouncedFn(data);
  }, [trackInteractionImpl]);

  return {
    trackInteraction,
    trackPageView,
    updatePageViewExit,
  };
}