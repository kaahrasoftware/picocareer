
import { useCallback } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAnalyticsBatch } from './useAnalyticsBatch';
import { useDebounce } from './useDebounce';

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

  const trackInteraction = useDebounce(trackInteractionImpl, 1000);

  return {
    trackInteraction,
    trackPageView,
  };
}
