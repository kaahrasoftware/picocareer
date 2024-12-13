import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Mentor from "./pages/Mentor";
import Career from "./pages/Career";
import Program from "./pages/Program";
import { MenuSidebar } from "./components/MenuSidebar";
import { Footer } from "./components/Footer";

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
          <div className="min-h-screen w-full">
            <MenuSidebar />
            <main className="w-full pt-16">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/mentor" element={<Mentor />} />
                <Route path="/career" element={<Career />} />
                <Route path="/program" element={<Program />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;