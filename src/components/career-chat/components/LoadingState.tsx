
import React from 'react';
import { Brain } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-50"></div>
          <div className="absolute inset-0 rounded-full border-4 border-blue-200 border-dashed animate-spin"></div>
          <div className="absolute inset-6 flex items-center justify-center">
            <Brain className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <h3 className="text-xl font-medium mb-2">Loading Career Assistant</h3>
        <p className="text-gray-500 max-w-xs">
          Preparing your personalized career assessment experience...
        </p>
      </div>
    </div>
  );
}
