
import React from 'react';
import { router } from '@/router/routes';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';
import { RouterProvider } from 'react-router-dom';

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
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <HubStorageInitializer />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
