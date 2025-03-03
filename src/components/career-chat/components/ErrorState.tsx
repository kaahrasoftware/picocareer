
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  retryAction?: () => void;
}

export function ErrorState({ 
  message = "The AI chat service is currently unavailable. Please try again later.",
  retryAction
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-800 mb-2">Service Unavailable</h3>
        <p className="text-red-700 mb-4">{message}</p>
        {retryAction && (
          <Button variant="outline" onClick={retryAction} className="mt-2">
            Try Again
          </Button>
        )}
        <div className="mt-4 text-sm text-red-600">
          <p>Administrator: Please check that the DeepSeek API key is properly configured in Supabase.</p>
        </div>
      </div>
    </div>
  );
}
