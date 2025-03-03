
import React from 'react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-3 bg-white/80 border max-w-[80%] rounded-lg shadow-sm">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
    </div>
  );
}
