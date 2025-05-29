
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { router } from './router/routes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background">
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <TooltipProvider>
            <Toaster />
            <RouterProvider router={router} />
          </TooltipProvider>
        </ThemeProvider>
      </div>
    </QueryClientProvider>
  );
}

export default App;
