
import React from 'react';
import { Loader2 } from 'lucide-react';
import { PageLoader } from '@/components/ui/page-loader';

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
      <div className="w-full max-w-3xl space-y-8">
        <div className="flex items-center justify-center mb-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          <h2 className="text-xl font-semibold">Loading Career Assistant</h2>
        </div>
        
        <div className="border rounded-lg p-4 bg-background/50">
          <PageLoader 
            isLoading={true} 
            variant="list" 
            count={4} 
          />
        </div>
      </div>
    </div>
  );
}
