
import React from 'react';
import { Avatar } from '@/components/ui/avatar';
import { Brain } from 'lucide-react';

interface ChatHeaderProps {
  isAnalyzing: boolean;
}

export function ChatHeader({ isAnalyzing }: ChatHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-10 w-10 bg-primary text-white flex items-center justify-center">
          <span className="text-lg font-semibold">P</span>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">Pico</h2>
          <p className="text-sm text-muted-foreground">AI Career Guide</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isAnalyzing && (
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 animate-pulse text-primary" />
            <span className="text-sm text-muted-foreground">Analyzing responses...</span>
          </div>
        )}
      </div>
    </div>
  );
}
