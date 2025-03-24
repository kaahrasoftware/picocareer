
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

type ErrorMapping = {
  [key: string]: string;
};

// Default error mappings for common errors
const DEFAULT_ERROR_MAPPINGS: ErrorMapping = {
  '23505': 'A record with this information already exists.',
  '42501': 'You don\'t have permission to perform this action.',
  'PGRST301': 'Authentication required. Please log in.',
  'PGRST302': 'Permission denied. You don\'t have access to this resource.',
  'auth/email-already-in-use': 'This email is already associated with an account.',
  'auth/weak-password': 'Please use a stronger password.',
  'auth/invalid-email': 'The email address is not valid.',
};

export function useFormErrorHandler(customMappings: ErrorMapping = {}) {
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Combine default and custom error mappings
  const errorMappings = { ...DEFAULT_ERROR_MAPPINGS, ...customMappings };
  
  const handleError = useCallback((error: any, defaultMessage = 'An unexpected error occurred.') => {
    console.error('Form error:', error);
    
    let errorMessage = defaultMessage;
    let errorCode = null;
    
    // Extract error code and message based on error structure
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorCode = error.code || (error.error?.code);
      
      // Attempt to extract the most meaningful message
      errorMessage = error.message || 
                     error.error?.message || 
                     error.details ||
                     error.error?.details ||
                     defaultMessage;
                     
      // Check for row-level security policy violations
      if (errorMessage.includes('violates row-level security policy')) {
        errorCode = 'RLS_VIOLATION';
        errorMappings['RLS_VIOLATION'] = 'Permission error: Please make sure you\'re logged in with the right account.';
      }
    }
    
    // Apply error mappings if we have a code match
    if (errorCode && errorMappings[errorCode]) {
      errorMessage = errorMappings[errorCode];
    }
    
    // Set the error state
    setError(errorMessage);
    
    // Also show toast for immediate feedback
    toast({
      title: "Error",
      description: errorMessage,
      variant: "destructive",
    });
    
    return errorMessage;
  }, [toast, errorMappings]);
  
  return {
    error,
    setError,
    handleError,
    clearError: () => setError(null)
  };
}
