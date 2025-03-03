
import React from 'react';

interface UserMessageProps {
  content: string;
}

export function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex flex-col items-end mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-primary text-primary-foreground transition-all hover:shadow">
        <p className="text-sm text-primary-foreground">{content}</p>
      </div>
    </div>
  );
}
