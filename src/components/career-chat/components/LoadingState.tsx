
import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-blue-50/50 to-white">
      <div className="flex flex-col items-center">
        <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
        <h3 className="text-lg font-semibold mb-2">Loading Career Chat</h3>
        <p className="text-muted-foreground text-center max-w-md">
          We're setting up your career exploration session...
        </p>
      </div>
    </div>
  );
}
