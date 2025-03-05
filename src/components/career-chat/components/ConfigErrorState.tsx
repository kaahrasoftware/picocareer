
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { MainLayout } from '@/router/layouts';

export function ConfigErrorState() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] gap-4 p-8 text-center">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-semibold">AI Chat Unavailable</h2>
        <p className="text-lg text-muted-foreground max-w-md">
          The career chat AI service is currently unavailable. Please try again later or contact an administrator.
        </p>
      </div>
    </MainLayout>
  );
}
