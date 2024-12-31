import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function useProfileAnalytics() {
  const location = useLocation();
  const { trackPageView, trackInteraction, updatePageViewExit } = useAnalytics();
  const startTime = Date.now();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Track initial page view
    trackPageView(currentPath);
    
    // Set up scroll tracking
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollPosition / maxScroll) * 100);
      
      trackInteraction({
        elementId: 'profile-scroll',
        elementType: 'scroll',
        interactionType: 'content_view',
        pagePath: currentPath,
        interactionData: { scrollPercentage }
      });
    };

    // Track page exit
    const cleanup = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction({
        elementId: 'profile-page',
        elementType: 'page',
        interactionType: 'page_view',
        pagePath: currentPath,
        interactionData: { timeSpent }
      });
      updatePageViewExit(currentPath);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [location.pathname, trackPageView, trackInteraction, updatePageViewExit, startTime]);

  const handleTabChange = useCallback((value: string) => {
    trackInteraction({
      elementId: `tab-${value}`,
      elementType: 'tab',
      interactionType: 'click',
      pagePath: location.pathname,
      interactionData: { tabName: value }
    });
  }, [trackInteraction, location.pathname]);

  const handleSearch = useCallback((query: string) => {
    trackInteraction({
      elementId: 'profile-search',
      elementType: 'search',
      interactionType: 'search',
      pagePath: location.pathname,
      interactionData: { searchQuery: query }
    });
  }, [trackInteraction, location.pathname]);

  const handleBookmark = useCallback((contentId: string, contentType: string) => {
    trackInteraction({
      elementId: `bookmark-${contentId}`,
      elementType: 'bookmark',
      interactionType: 'bookmark',
      pagePath: location.pathname,
      interactionData: { contentType }
    });
  }, [trackInteraction, location.pathname]);

  return {
    handleTabChange,
    handleSearch,
    handleBookmark,
  };
}