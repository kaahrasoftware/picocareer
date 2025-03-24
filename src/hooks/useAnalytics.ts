
import { useCallback, useRef } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAnalyticsBatch } from './useAnalyticsBatch';
import { useDebouncedCallback } from './useDebounce';

type InteractionType = 'page_view' | 'click' | 'search' | 'bookmark' | 'content_view';

interface InteractionData {
  elementId?: string;
  elementType?: string;
  interactionType: InteractionType;
  pagePath: string;
  interactionData?: any;
}

export function useAnalytics() {
  const { session } = useAuthSession();
  const { addEvent } = useAnalyticsBatch();
  const pageViewRef = useRef<Record<string, boolean>>({});

  const trackInteractionImpl = useCallback(
    (data: InteractionData) => {
      if (!session?.user?.id) return;

      addEvent(data.interactionType, {
        profile_id: session.user.id,
        element_id: data.elementId,
        element_type: data.elementType,
        page_path: data.pagePath,
        interaction_data: data.interactionData,
      });
    },
    [session?.user?.id, addEvent]
  );

  const trackPageView = useCallback(
    async (pagePath: string) => {
      if (!session?.user?.id) return;
      
      // Prevent duplicate page views in the same session
      const pageKey = `${pagePath}-${session.user.id}`;
      if (pageViewRef.current[pageKey]) return;
      
      pageViewRef.current[pageKey] = true;
      
      // Clear the record after 15 minutes to allow tracking again (increased from 5 minutes)
      setTimeout(() => {
        delete pageViewRef.current[pageKey];
      }, 15 * 60 * 1000);

      addEvent('page_view', {
        profile_id: session.user.id,
        page_path: pagePath,
        interaction_data: {
          timestamp: new Date().toISOString(),
        },
      });
    },
    [session?.user?.id, addEvent]
  );

  // Using useDebouncedCallback with longer timeout (10 seconds, increased from 2s)
  const trackInteraction = useDebouncedCallback(trackInteractionImpl, 10000);

  return {
    trackInteraction,
    trackPageView,
  };
}
