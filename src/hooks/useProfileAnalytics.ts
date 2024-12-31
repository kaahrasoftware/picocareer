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
        trackInteraction(
          'profile-scroll',
          'scroll',
          'content_view',
          location.pathname,
          { scrollPercentage }
        );
        setLastScrollPosition(scrollPosition);
      }
    };

    // Track page exit
    const cleanup = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      trackInteraction(
        'profile-page',
        'page',
        'page_view',
        location.pathname,
        { timeSpent }
      );
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
    trackInteraction(
      `tab-${value}`,
      'tab',
      'click',
      location.pathname,
      { tabName: value }
    );
  };

  const handleSearch = (query: string) => {
    trackInteraction(
      'profile-search',
      'search',
      'search',
      location.pathname,
      { searchQuery: query }
    );
  };

  const handleBookmark = (contentId: string, contentType: string) => {
    trackInteraction(
      `bookmark-${contentId}`,
      'bookmark',
      'bookmark',
      location.pathname,
      { contentType }
    );
  };

  return {
    handleTabChange,
    handleSearch,
    handleBookmark,
  };
}