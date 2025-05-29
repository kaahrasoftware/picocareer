
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "./context/AuthContext"
import { router } from './router/routes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
            <TooltipProvider>
              <Toaster />
              <RouterProvider router={router} />
            </TooltipProvider>
          </ThemeProvider>
        </div>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
