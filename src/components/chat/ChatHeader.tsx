
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

interface ChatHeaderProps {
  isAnalyzing?: boolean;
}

export function ChatHeader({ isAnalyzing }: ChatHeaderProps) {
  return (
    <div className="p-4 border-b bg-gradient-to-r from-white to-blue-50 rounded-t-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-7 w-7 text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-800">AI Career Guide</h3>
            <p className="text-sm text-muted-foreground">Chat with Pico to explore career options</p>
          </div>
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
