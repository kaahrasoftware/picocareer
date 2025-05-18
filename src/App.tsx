
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { AppRoutes } from "@/router/AppRoutes";
import { AuthProvider } from "@/context/AuthContext";
import { SessionTimeoutHandler } from "@/components/auth/SessionTimeoutHandler";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <div className="relative">
      <QueryClientProvider client={queryClient}>
        <Router>
          <AuthProvider>
            <ThemeProvider defaultTheme="light" storageKey="picocareer-theme">
              <SessionTimeoutHandler />
              <AppRoutes />
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </Router>
      </QueryClientProvider>
    </div>
  );
}

export default App;
