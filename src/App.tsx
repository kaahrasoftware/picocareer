import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { GoToTopButton } from "@/components/ui/go-to-top-button";
import { Footer } from "@/components/Footer";
import { AppRoutes } from "./AppRoutes";
import "./App.css";

const queryClient = new QueryClient();

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <AppRoutes />
      </main>
      <GoToTopButton />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;