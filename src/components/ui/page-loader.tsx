import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { cn } from '@/lib/utils';

interface PageLoaderProps {
  isLoading: boolean;
  className?: string;
  variant?: 'default' | 'cards' | 'table' | 'list';
  count?: number;
}

export function PageLoader({ 
  isLoading, 
  className = "",
  variant = 'default',
  count = 3
}: PageLoaderProps) {
  if (!isLoading) return null;
  
  const renderContent = () => {
    switch (variant) {
      case 'cards':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 bg-[#F1F0FB]"> {/* very light background */}
                <Skeleton className="h-4 w-3/4 bg-[#E5DEFF]" />
                <Skeleton className="h-10 w-full bg-[#E5DEFF]" />
                <Skeleton className="h-20 w-full bg-[#E5DEFF]" />
                <div className="flex space-x-2 pt-2">
                  <Skeleton className="h-5 w-16 bg-[#D6BCFA]" />
                  <Skeleton className="h-5 w-16 bg-[#D6BCFA]" />
                </div>
              </div>
            ))}
          </div>
        );
        
      case 'table':
        return (
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-muted p-4">
              <Skeleton className="h-5 w-full" />
            </div>
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="flex items-center p-4 border-t">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-8 w-24" />
              </div>
            ))}
          </div>
        );
        
      case 'list':
        return (
          <div className="space-y-3">
            {Array(count).fill(0).map((_, i) => (
              <div key={i} className="flex items-center p-2 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="ml-4 space-y-2 flex-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        );
        
      default:
        return (
          <div className="space-y-4 bg-[#F1F0FB] p-3 rounded-lg">
            <Skeleton className="h-8 w-[250px] bg-[#E5DEFF]" />
            <Skeleton className="h-4 w-[350px] bg-[#E5DEFF]" />
            <div className="h-[2px] my-6" />
            <Skeleton className="h-64 w-full rounded-lg bg-[#E5DEFF]" />
          </div>
        );
    }
  };
  
  return (
    <div className={cn("animate-fade-in", className)}>
      {renderContent()}
    </div>
  );
}
