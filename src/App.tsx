import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Career from "@/pages/Career";
import Mentor from "@/pages/Mentor";
import Blog from "@/pages/Blog";
import Video from "@/pages/Video";

import "./App.css";

function App() {
  return (
    <Router>
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
      <Toaster />
    </Router>
  );
}

export default App;