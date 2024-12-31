import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalyticsBatch } from '@/hooks/useAnalyticsBatch';
import { supabase } from '@/integrations/supabase/client';

export const useSearchAnalytics = () => {
  const location = useLocation();
  const { addEvent } = useAnalyticsBatch();

  const trackSearch = useCallback(async (query: string, resultsCount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id && query.length >= 3) {
        addEvent('search', {
          interaction_data: {
            query,
            results_count: resultsCount
          },
          page_path: location.pathname,
          profile_id: user.id
        });
      }
    } catch (error) {
      console.error('Error tracking search:', error);
    }
  }, [addEvent, location.pathname]);

  return { trackSearch };
};