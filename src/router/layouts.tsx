
import React from 'react';
import { MenuSidebar } from '@/components/MenuSidebar';
import { GoToTopButton } from '@/components/ui/go-to-top-button';

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <MenuSidebar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
        <GoToTopButton />
      </main>
    </div>
  );
}
