
import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  fullScreen?: boolean;
  className?: string;
  withBlur?: boolean;
}

export function LoadingOverlay({
  isLoading,
  message = 'Loading...',
  fullScreen = false,
  className,
  withBlur = true,
}: LoadingOverlayProps) {
  if (!isLoading) return null;
  
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center transition-all duration-300 ease-in-out",
        withBlur ? "bg-background/80 backdrop-blur-sm" : "bg-background/50",
        fullScreen 
          ? "fixed inset-0 z-50" 
          : "absolute inset-0 z-10",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-4 text-center animate-fade-in">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        {message && (
          <p className="text-sm font-medium text-muted-foreground">{message}</p>
        )}
      </div>
    </div>
  );
}
