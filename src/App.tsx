import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import About from "./pages/About";
import Auth from "./pages/Auth";
import Blog from "./pages/Blog";
import BlogUpload from "./pages/BlogUpload";
import Career from "./pages/Career";
import CareerUpload from "./pages/CareerUpload";
import MajorUpload from "./pages/MajorUpload";
import Mentor from "./pages/Mentor";
import MentorRegistration from "./pages/MentorRegistration";
import Profile from "./pages/Profile";
import Program from "./pages/Program";
import Video from "./pages/Video";
import "./App.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="picocareer-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/upload" element={<BlogUpload />} />
            <Route path="/career" element={<Career />} />
            <Route path="/career/upload" element={<CareerUpload />} />
            <Route path="/major/upload" element={<MajorUpload />} />
            <Route path="/mentor" element={<Mentor />} />
            <Route path="/mentor/register" element={<MentorRegistration />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/program" element={<Program />} />
            <Route path="/video" element={<Video />} />
          </Routes>
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;