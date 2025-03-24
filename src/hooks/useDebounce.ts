
import { useCallback, useRef, useState, useEffect } from 'react';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  options: { leading?: boolean } = {}
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const callbackRef = useRef<T>(callback);
  const leadingCallMadeRef = useRef<boolean>(false);
  
  // Update the callback ref whenever the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    (...args: Parameters<T>) => {
      const { leading = false } = options;
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // If leading is true and we haven't made the leading call yet,
      // call the function immediately
      if (leading && !leadingCallMadeRef.current) {
        callbackRef.current(...args);
        leadingCallMadeRef.current = true;
        
        // Reset the leadingCallMade after the delay
        timeoutRef.current = setTimeout(() => {
          leadingCallMadeRef.current = false;
        }, delay);
        
        return;
      }

      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
        leadingCallMadeRef.current = false;
      }, delay);
    },
    [delay, options] // Only delay and options are dependencies, callback is stored in ref
  );
}
