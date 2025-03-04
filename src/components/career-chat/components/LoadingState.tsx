
import React from 'react';
import { Loader2 } from 'lucide-react';
import { MainLayout } from '@/router/layouts';

export function LoadingState() {
  return (
    <MainLayout>
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    </MainLayout>
  );
}
