
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';

/**
 * Hook to handle page transition loading states
 * @param delay Optional delay in ms before showing loading state to prevent flashes
 */
export function usePageLoading(delay: number = 100) {
  const location = useLocation();
  const { setPageLoading } = useLoading();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Show loading after a delay to prevent flashing on fast loads
    timeoutId = setTimeout(() => {
      setPageLoading(true);
    }, delay);

    // Simulate page load completion delay 
    const loadingTimeout = setTimeout(() => {
      setPageLoading(false);
    }, 400);

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(loadingTimeout);
    };
  }, [location.pathname, setPageLoading, delay]);
}
