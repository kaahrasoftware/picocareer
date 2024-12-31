import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export function useProfileAnalytics() {
  const location = useLocation();
  const { trackPageView, trackInteraction, updatePageViewExit } = useAnalytics();
  const [startTime] = useState(Date.now());
  const [lastScrollPosition, setLastScrollPosition] = useState(0);

  useEffect(() => {
    // Track initial page view
    trackPageView(location.pathname);
    
    // Set up scroll tracking
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollPosition / maxScroll) * 100);
      
      // Only track if scroll position has changed significantly (more than 25%)
      if (Math.abs(scrollPosition - lastScrollPosition) > maxScroll * 0.25) {
        trackInteraction({
          elementId: 'profile-scroll',
          elementType: 'scroll',
          interactionType: 'content_view',
          pagePath: location.pathname,
          interactionData: { scrollPercentage }
        });
        setLastScrollPosition(scrollPosition);
      }
    };

    // Track page exit
    const cleanup = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction({
        elementId: 'profile-page',
        elementType: 'page',
        interactionType: 'page_view',
        pagePath: location.pathname,
        interactionData: { timeSpent }
      });
      updatePageViewExit(location.pathname);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('beforeunload', cleanup);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', cleanup);
      cleanup();
    };
  }, [location.pathname, startTime, lastScrollPosition, trackInteraction, trackPageView, updatePageViewExit]);

  const handleTabChange = (value: string) => {
    trackInteraction({
      elementId: `tab-${value}`,
      elementType: 'tab',
      interactionType: 'click',
      pagePath: location.pathname,
      interactionData: { tabName: value }
    });
  };

  const handleSearch = (query: string) => {
    trackInteraction({
      elementId: 'profile-search',
      elementType: 'search',
      interactionType: 'search',
      pagePath: location.pathname,
      interactionData: { searchQuery: query }
    });
  };

  const handleBookmark = (contentId: string, contentType: string) => {
    trackInteraction({
      elementId: `bookmark-${contentId}`,
      elementType: 'bookmark',
      interactionType: 'bookmark',
      pagePath: location.pathname,
      interactionData: { contentType }
    });
  };

  return {
    handleTabChange,
    handleSearch,
    handleBookmark,
  };
}