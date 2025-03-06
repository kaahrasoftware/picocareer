
import React from 'react';

export function ChatTypingIndicator() {
  return (
    <div className="flex items-center space-x-1 p-2 bg-white/80 border max-w-[80%] rounded-lg shadow-sm animate-fade-in" style={{animationDuration: '100ms'}}>
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.4s'}} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.4s', animationDelay: '0.1s'}} />
      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{animationDuration: '0.4s', animationDelay: '0.2s'}} />
    </div>
  );
}
