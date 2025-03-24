
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function useProfileAnalytics() {
  const location = useLocation();
  const { trackPageView, trackInteraction } = useAnalytics();
  const startTime = useRef(Date.now());
  const lastScrollTrack = useRef(Date.now());
  const scrollThrottleMs = 5000; // Only track scroll events every 5 seconds

  useEffect(() => {
    if (!trackPageView) return;
    
    const currentPath = location.pathname;
    
    // Track initial page view, only once
    trackPageView(currentPath);
    
    // Set up throttled scroll tracking
    const handleScroll = () => {
      if (!trackInteraction) return;
      
      // Skip if we've tracked a scroll event recently
      const now = Date.now();
      if (now - lastScrollTrack.current < scrollThrottleMs) {
        return;
      }
      
      lastScrollTrack.current = now;
      const scrollPosition = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      
      // Only track if user has scrolled significantly (>25%)
      const scrollPercentage = Math.round((scrollPosition / maxScroll) * 100);
      if (scrollPercentage > 25) {
        trackInteraction({
          elementId: 'profile-scroll',
          elementType: 'scroll',
          interactionType: 'content_view',
          pagePath: currentPath,
          interactionData: { scrollPercentage }
        });
      }
    };

    // Track page exit, but only once
    const cleanup = () => {
      if (!trackInteraction) return;
      
      const timeSpent = Math.floor((Date.now() - startTime.current) / 1000);
      // Only track if user spent significant time (>5 seconds)
      if (timeSpent > 5) {
        trackInteraction({
          elementId: 'profile-page',
          elementType: 'page',
          interactionType: 'page_view',
          pagePath: currentPath,
          interactionData: { timeSpent }
        });
      }
    };

    // Use passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [location.pathname, trackPageView, trackInteraction]);

  // Throttled tab change handler
  const handleTabChange = useCallback((value: string) => {
    if (!trackInteraction) return;
    
    trackInteraction({
      elementId: `tab-${value}`,
      elementType: 'tab',
      interactionType: 'click',
      pagePath: location.pathname,
      interactionData: { tabName: value }
    });
  }, [trackInteraction, location.pathname]);

  // Throttled search handler
  const handleSearch = useCallback((query: string) => {
    if (!trackInteraction || query.length < 3) return;
    
    trackInteraction({
      elementId: 'profile-search',
      elementType: 'search',
      interactionType: 'search',
      pagePath: location.pathname,
      interactionData: { searchQuery: query }
    });
  }, [trackInteraction, location.pathname]);

  return {
    handleTabChange,
    handleSearch,
  };
}
