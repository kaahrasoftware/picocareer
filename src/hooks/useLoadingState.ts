
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useLoading } from '@/context/LoadingContext';

interface UseLoadingStateOptions {
  initialMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  showToasts?: boolean;
  showGlobalLoading?: boolean;
}

/**
 * A hook to manage component-level loading states with optional global loading indications
 */
export function useLoadingState(options: UseLoadingStateOptions = {}) {
  const {
    initialMessage = 'Loading...',
    successMessage,
    errorMessage = 'Something went wrong',
    showToasts = true,
    showGlobalLoading = false
  } = options;
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { startLoading, stopLoading, updateProgress } = useLoading();
  const { toast } = useToast();

  // Function to wrap async operations with loading state management
  const withLoading = async <T,>(
    operation: () => Promise<T>,
    customOptions?: {
      loadingMessage?: string;
      successMessage?: string;
      errorMessage?: string;
    }
  ): Promise<T | null> => {
    const loadingMessage = customOptions?.loadingMessage || initialMessage;
    const completeMessage = customOptions?.successMessage || successMessage;
    const failMessage = customOptions?.errorMessage || errorMessage;
    
    try {
      setIsLoading(true);
      setError(null);
      
      if (showGlobalLoading) {
        startLoading(loadingMessage);
      }
      
      const result = await operation();
      
      if (showToasts && completeMessage) {
        toast({
          title: "Success",
          description: completeMessage,
        });
      }
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      if (showToasts) {
        toast({
          title: "Error",
          description: failMessage,
          variant: "destructive",
        });
      }
      
      console.error("Operation failed:", error);
      return null;
    } finally {
      setIsLoading(false);
      
      if (showGlobalLoading) {
        stopLoading();
      }
    }
  };

  return {
    isLoading,
    setIsLoading,
    error,
    setError,
    withLoading,
    updateProgress
  };
}
