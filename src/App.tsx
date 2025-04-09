
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { router } from '@/router/routes';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';
import { LoadingProvider, useLoading } from '@/context/LoadingContext';
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

// Separate component to properly use the useLoading hook
function AppContent() {
  const { globalLoading } = useLoading();
  
  return (
    <>
      <RouterProvider router={router} />
      <HubStorageInitializer />
      <Toaster />
    </>
  );
}

// Main App component with proper provider nesting
function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <LoadingProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LoadingProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
