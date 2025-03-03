
import React from 'react';

interface BotMessageProps {
  content: string;
}

export function BotMessage({ content }: BotMessageProps) {
  return (
    <div className="flex flex-col items-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-white border border-blue-100 transition-all hover:shadow">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
