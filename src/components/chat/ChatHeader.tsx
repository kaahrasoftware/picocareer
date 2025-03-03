
import React from 'react';
import { Loader2 } from 'lucide-react';

interface ChatHeaderProps {
  isAnalyzing?: boolean;
}

export function ChatHeader({ isAnalyzing }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b bg-card">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">AI Career Guide</h3>
          <p className="text-sm text-muted-foreground">Chat with Pico to explore career options</p>
        </div>
        {isAnalyzing && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing your responses...
          </div>
        )}
      </div>
    </div>
  );
}
