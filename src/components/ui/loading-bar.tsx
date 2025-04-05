
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface LoadingBarProps {
  isLoading: boolean;
  progress?: number;
  className?: string;
  autoIncrement?: boolean;
}

export function LoadingBar({
  isLoading,
  progress = 0,
  className,
  autoIncrement = true,
}: LoadingBarProps) {
  const [value, setValue] = useState(progress);
  const [visible, setVisible] = useState(isLoading);
  
  useEffect(() => {
    if (isLoading) {
      setVisible(true);
      setValue(progress);
      
      if (autoIncrement && progress < 100) {
        // Simulate progress with a non-linear curve to feel more natural
        const interval = setInterval(() => {
          setValue((prevValue) => {
            if (prevValue >= 90) {
              clearInterval(interval);
              return prevValue;
            }
            
            // Slow down as we approach 90%
            const increment = Math.max(0.5, (100 - prevValue) / 20);
            return Math.min(90, prevValue + increment);
          });
        }, 200);
        
        return () => clearInterval(interval);
      }
    } else if (!isLoading && value >= 100) {
      // When loading finishes, quickly go to 100% then hide
      setValue(100);
      const timeout = setTimeout(() => {
        setVisible(false);
        // Reset after animation completes
        setTimeout(() => setValue(0), 300);
      }, 500);
      return () => clearTimeout(timeout);
    } else if (!isLoading) {
      setValue(100);
      // Hide after completion
      const timeout = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setValue(0), 300);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, autoIncrement, progress, value]);
  
  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-opacity duration-300",
      visible ? "opacity-100" : "opacity-0",
      className
    )}>
      <Progress
        value={value} 
        className="h-1 rounded-none bg-background"
      />
    </div>
  );
}
