import { useCallback } from 'react';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useAnalyticsBatch } from './useAnalyticsBatch';
import { useDebounce } from './useDebounce';

interface InteractionData {
  elementId: string;
  elementType: string;
  interactionType: 'click' | 'search' | 'bookmark' | 'content_view' | 'page_view';
  pagePath: string;
  interactionData?: any;
}

export function useAnalytics() {
  const { session } = useAuthSession();
  const { addEvent } = useAnalyticsBatch();

  const trackInteractionImpl = useCallback(
    (data: InteractionData) => {
      if (!session?.user?.id) return;

      addEvent('interaction', {
        profile_id: session.user.id,
        ...data,
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
        timestamp: new Date().toISOString(),
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