
import React from 'react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-start gap-2 max-w-[80%]">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-primary text-xs">P</span>
      </div>
      <div className="flex items-center gap-1.5 p-3 bg-card/50 border border-border/50 backdrop-blur-sm rounded-lg rounded-tl-none">
        <div className="w-2 h-2 rounded-full bg-primary/70 animate-bounce" />
        <div className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.2s]" />
        <div className="w-2 h-2 rounded-full bg-primary/70 animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
}
