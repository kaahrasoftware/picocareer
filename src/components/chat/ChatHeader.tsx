
import React from 'react';
import { Loader2, Bot, Stars } from 'lucide-react';

interface ChatHeaderProps {
  isAnalyzing?: boolean;
}

export function ChatHeader({ isAnalyzing }: ChatHeaderProps) {
  return (
    <div className="p-4 mb-4 bg-card rounded-lg shadow-md border border-border/50 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-primary/20 p-2 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1">
              <Stars className="h-4 w-4 text-yellow-400" />
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-primary">AI Career Guide</h3>
            <p className="text-sm text-muted-foreground">Chat with Pico to explore career options</p>
          </div>
        </div>
        {isAnalyzing && (
          <div className="flex items-center px-3 py-1.5 rounded-full bg-primary/10 text-sm text-primary">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Analyzing your responses...
          </div>
        )}
      </div>
    </div>
  );
}
