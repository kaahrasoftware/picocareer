import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './components/ui/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { Router } from './Router';
import { Toaster } from '@/components/ui/toaster';
import { RouteChangeHandler } from './RouteChangeHandler';
import { SessionTimeoutHandler } from './SessionTimeoutHandler';
import { HubStorageInitializer } from './components/hub/HubStorageInitializer';

// Import RealTimeProvider
import { RealTimeProvider } from "./components/RealTimeProvider";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <RealTimeProvider>
            <RouteChangeHandler />
            <SessionTimeoutHandler />
            <Router />
            <Toaster />
            <HubStorageInitializer />
          </RealTimeProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
