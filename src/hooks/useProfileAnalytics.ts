import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function useProfileAnalytics() {
  const location = useLocation();
  const { trackPageView, trackInteraction } = useAnalytics();
  const [startTime] = useState(Date.now());

  useEffect(() => {
    trackPageView(location.pathname);
    
    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction(
        'profile-page',
        'page',
        'page_view',
        location.pathname,
        { timeSpent }
      );
    };
  }, [location.pathname, startTime, trackInteraction, trackPageView]);

  const handleTabChange = (value: string) => {
    trackInteraction(
      `tab-${value}`,
      'tab',
      'click',
      location.pathname,
      { tabName: value }
    );
  };

  return { handleTabChange };
}