
import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export function useProfileAnalytics() {
  const location = useLocation();
  const { trackPageView, trackInteraction } = useAnalytics();
  const startTime = useRef(Date.now());
  const lastScrollTrack = useRef(Date.now());
  const hasTrackedInitialView = useRef(false);
  const scrollThrottleMs = 15000; // Only track scroll events every 15 seconds (increased from 5s)
  const pathRef = useRef(location.pathname);

  useEffect(() => {
    if (!trackPageView) return;
    
    const currentPath = location.pathname;
    
    // Only track page view when the path changes or on first load
    if (currentPath !== pathRef.current || !hasTrackedInitialView.current) {
      hasTrackedInitialView.current = true;
      pathRef.current = currentPath;
      
      // Small delay to ensure we don't flood with events on page load
      setTimeout(() => {
        trackPageView(currentPath);
      }, 1000);
    }
    
    // Reset timer for new path
    startTime.current = Date.now();
    
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
      
      // Only track if user has scrolled significantly (>50%)
      const scrollPercentage = Math.round((scrollPosition / maxScroll) * 100);
      if (scrollPercentage > 50) {
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
      // Only track if user spent significant time (>10 seconds)
      if (timeSpent > 10) {
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

  // Heavily throttled tab change handler (5 second delay)
  const handleTabChange = useDebouncedCallback((value: string) => {
    if (!trackInteraction) return;
    
    trackInteraction({
      elementId: `tab-${value}`,
      elementType: 'tab',
      interactionType: 'click',
      pagePath: location.pathname,
      interactionData: { tabName: value }
    });
  }, 5000);

  // Heavily throttled search handler (5 second delay)
  const handleSearch = useDebouncedCallback((query: string) => {
    if (!trackInteraction || query.length < 3) return;
    
    trackInteraction({
      elementId: 'profile-search',
      elementType: 'search',
      interactionType: 'search',
      pagePath: location.pathname,
      interactionData: { searchQuery: query }
    });
  }, 5000);

  return {
    handleTabChange,
    handleSearch,
  };
}
