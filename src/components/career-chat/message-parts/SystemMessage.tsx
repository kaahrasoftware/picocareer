
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface SystemMessageProps {
  content: string;
}

export function SystemMessage({ content }: SystemMessageProps) {
  return (
    <div className="flex flex-col items-start mb-4">
      <div className="max-w-[90%] rounded-lg px-4 py-3 shadow-sm bg-amber-50 border border-amber-200 flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">{content}</p>
      </div>
    </div>
  );
}
