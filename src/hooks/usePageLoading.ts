
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';

/**
 * Hook to manage page transition loading states
 * Returns an object with loading state and control functions
 */
export function usePageLoading() {
  const location = useLocation();
  const { globalLoading, startLoading, stopLoading, updateProgress } = useLoading();

  useEffect(() => {
    // Start loading on route change
    startLoading('Loading page...');
    
    // Generate random progress updates to simulate loading
    const interval = setInterval(() => {
      const nextProgress = Math.min(95, Math.random() * 10 + globalLoading.progress);
      updateProgress(nextProgress);
    }, 200);
    
    // Simulate page load completion
    const timer = setTimeout(() => {
      clearInterval(interval);
      updateProgress(100);
      
      // Add a small delay to ensure the progress bar animation completes
      setTimeout(() => {
        stopLoading();
      }, 300);
    }, 700);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [location.pathname]);
  
  return { 
    isLoading: globalLoading.isLoading,
    progress: globalLoading.progress,
    message: globalLoading.message
  };
}
