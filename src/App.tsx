
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { router } from '@/router/routes';
import { HubStorageInitializer } from '@/components/hub/HubStorageInitializer';
import { AuthProvider } from '@/context/AuthContext';
import { GuideProvider } from '@/context/GuideContext';
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
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Separate component to allow proper Hook usage and context inheritance
function AppContent() {
  return (
    <RouterProvider router={router}>
      <GuideProvider>
        <HubStorageInitializer />
        <Toaster />
      </GuideProvider>
    </RouterProvider>
  );
}

export default App;
