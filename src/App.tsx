import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Index from "./pages/Index";
import Blog from "./pages/Blog";
import Mentor from "./pages/Mentor";
import Career from "./pages/Career";
import Program from "./pages/Program";
import Video from "./pages/Video";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import { MenuSidebar } from "./components/MenuSidebar";
import { Footer } from "./components/Footer";

// Wrapper component to conditionally render footer
const AppContent = () => {
  const location = useLocation();
  const isVideoPage = location.pathname === '/video';
  const isAuthPage = location.pathname === '/auth';

  return (
    <div className="min-h-screen w-full">
      {!isAuthPage && <MenuSidebar />}
      <main className={`w-full ${!isAuthPage ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/career" element={<Career />} />
          <Route path="/program" element={<Program />} />
          <Route path="/video" element={<Video />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      {!isVideoPage && !isAuthPage && <Footer />}
    </div>
  );
};

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
          <AppContent />
          <Toaster />
          <Sonner />
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
