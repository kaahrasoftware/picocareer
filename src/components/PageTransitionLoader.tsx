
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/context/LoadingContext';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function PageTransitionLoader() {
  const location = useLocation();
  const { isLoading, setIsLoading } = useLoading();

  // When location changes, show loading state briefly
  useEffect(() => {
    setIsLoading(true);
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 500); // Short timeout for smooth transitions

    return () => clearTimeout(timeout);
  }, [location.pathname, setIsLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50 bg-background">
      <div className="h-full bg-primary animate-progress-bar"></div>
      <div className="fixed top-4 right-4">
        <LoadingSpinner size="sm" />
      </div>
    </div>
  );
}
