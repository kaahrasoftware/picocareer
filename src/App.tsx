import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Career from "@/pages/Career";
import Mentor from "@/pages/Mentor";
import Blog from "@/pages/Blog";
import Video from "@/pages/Video";
import { MenuSidebar } from "@/components/MenuSidebar";
import { Footer } from "@/components/Footer";
import { useState } from "react";

import "./App.css";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen w-full">
          <MenuSidebar />
          <main className="w-full pt-16">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/program" element={<Program />} />
              <Route path="/career" element={<Career />} />
              <Route path="/mentor" element={<Mentor />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/video" element={<Video />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster />
        <Sonner />
      </Router>
    </QueryClientProvider>
  );
}

export default App;