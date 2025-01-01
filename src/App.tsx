import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./AppRoutes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <AppRoutes />
          <Toaster />
        </SidebarProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;