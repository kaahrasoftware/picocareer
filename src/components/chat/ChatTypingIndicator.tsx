
import React from 'react';
import { Avatar } from '@/components/ui/avatar';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 bg-primary text-white flex items-center justify-center">
        <span className="text-sm font-semibold">P</span>
      </Avatar>
      <div className="flex-1 bg-muted rounded-lg p-3 text-sm">
        <div className="flex space-x-2 items-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping"></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
}
