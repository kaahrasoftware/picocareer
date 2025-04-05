
import { RouterProvider } from 'react-router-dom';
import router from './router/routes';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from '@/context/LoadingContext';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <RouterProvider router={router} />
        <Toaster />
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
