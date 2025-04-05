
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';

/**
 * Hook to manage page transition loading states
 */
export function usePageLoading() {
  const location = useLocation();
  const { globalLoading, startLoading, stopLoading, updateProgress } = useLoading();

  useEffect(() => {
    // Start loading on route change
    startLoading('Loading page...');
    
    // Simulate page load progress
    const timer = setTimeout(() => {
      updateProgress(100);
      stopLoading();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [location.pathname]);
  
  return globalLoading;
}
