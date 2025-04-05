
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
  
  useEffect(() => {
    if (isLoading && autoIncrement) {
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
    } else if (!isLoading) {
      // When loading finishes, quickly go to 100% then reset
      setValue(100);
      const timeout = setTimeout(() => setValue(0), 500);
      return () => clearTimeout(timeout);
    } else {
      // If manual progress is being used
      setValue(progress);
    }
  }, [isLoading, autoIncrement, progress]);
  
  return (
    <div className={cn("fixed top-0 left-0 right-0 z-50 transition-opacity", 
      isLoading ? "opacity-100" : "opacity-0",
      className
    )}>
      <Progress
        value={value} 
        className="h-1 rounded-none bg-background"
      />
    </div>
  );
}
