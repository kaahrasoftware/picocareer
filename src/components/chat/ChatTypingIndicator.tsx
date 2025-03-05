
import React from 'react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-3 bg-white/80 border max-w-[80%] rounded-lg shadow-sm animate-fade-in" style={{animationDuration: '150ms'}}>
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.6s'}} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.6s', animationDelay: '0.1s'}} />
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.6s', animationDelay: '0.2s'}} />
    </div>
  );
}
