
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from "./components/ThemeProvider"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AuthProvider } from "@/context/AuthContext"
import { GuideProvider } from "@/context/GuideContext"
import { WelcomeDialog } from "@/components/guide/WelcomeDialog"
import { router } from './router/routes';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GuideProvider>
          <div className="min-h-screen bg-background">
            <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
              <TooltipProvider>
                <Toaster />
                <RouterProvider router={router} />
                <WelcomeDialog />
              </TooltipProvider>
            </ThemeProvider>
          </div>
        </GuideProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
