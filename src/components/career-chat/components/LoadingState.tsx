
import React from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-muted-foreground text-sm animate-pulse">
          Loading career assistant...
        </p>
      </div>
    </div>
  );
}
