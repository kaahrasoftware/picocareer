import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Community from "./pages/Community";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
        <Sonner />
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;