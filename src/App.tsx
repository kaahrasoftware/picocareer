
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { router } from '@/router/routes';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';
import { LoadingProvider } from '@/context/LoadingContext';
import { AuthProvider } from '@/context/AuthContext';
import './styles/guide.css'; // Import guide styles

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <AuthProvider>
            <RouterProvider router={router} />
            <HubStorageInitializer />
            <Toaster />
          </AuthProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
