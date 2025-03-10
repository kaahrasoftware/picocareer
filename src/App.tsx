
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { router } from '@/router/routes';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';

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
      <AppContent />
    </QueryClientProvider>
  );
}

// Separate component to allow proper Hook usage and context inheritance
function AppContent() {
  return (
    <>
      <RouterProvider router={router} />
      <HubStorageInitializer />
      <Toaster />
    </>
  );
}

export default App;
