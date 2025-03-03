
import React from 'react';

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  return (
    <div className="flex flex-col items-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-white border">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}
