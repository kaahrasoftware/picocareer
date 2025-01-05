import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "@/contexts/SearchContext";
import { Toaster } from "@/components/ui/toaster";
import { Layout } from "@/components/Layout";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SearchProvider>
            <Layout />
            <Toaster />
          </SearchProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </QueryClientProvider>
  );
};

export default App;