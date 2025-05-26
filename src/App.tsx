
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/context/AuthContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { GuideProvider } from '@/context/GuideContext';
import { MobileMenuProvider } from '@/context/MobileMenuContext';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AppRoutes } from '@/router/AppRoutes';
import ScrollToTop from '@/components/ScrollToTop';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <LoadingProvider>
              <GuideProvider>
                <MobileMenuProvider>
                  <div className="min-h-screen bg-gradient-to-br from-white to-gray-100">
                    <ScrollToTop />
                    <AppRoutes />
                    <Toaster />
                    <Sonner />
                  </div>
                </MobileMenuProvider>
              </GuideProvider>
            </LoadingProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
