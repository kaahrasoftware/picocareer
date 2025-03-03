
import React from 'react';

interface SystemMessageProps {
  content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
  return (
    <div className="flex flex-col items-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-muted/80">
        <p className="text-sm">{content}</p>
      </div>
    </div>
  );
}
