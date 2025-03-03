
import React from 'react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-3 bg-muted/50 max-w-[80%] rounded-lg">
      <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
    </div>
  );
}
