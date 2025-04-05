
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { router } from '@/router/routes';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';
import { AuthProvider } from '@/context/AuthContext';
import { LoadingProvider } from '@/context/LoadingContext';
import { LoadingBar } from '@/components/ui/loading-bar';
import { useLoading } from '@/context/LoadingContext';
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
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

// Separate component to allow proper Hook usage and context inheritance
function AppContent() {
  const { globalLoading } = useLoading();
  
  return (
    <>
      <LoadingBar 
        isLoading={globalLoading.isLoading} 
        progress={globalLoading.progress} 
      />
      <RouterProvider router={router} />
      <HubStorageInitializer />
      <Toaster />
    </>
  );
}

export default App;
