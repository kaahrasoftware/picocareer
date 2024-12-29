import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogUpload from "@/pages/BlogUpload";
import Career from "@/pages/Career";
import CareerUpload from "@/pages/CareerUpload";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Video from "@/pages/Video";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/upload" element={<BlogUpload />} />
      <Route path="/career" element={<Career />} />
      <Route path="/career/upload" element={<CareerUpload />} />
      <Route path="/major/upload" element={<MajorUpload />} />
      <Route path="/mentor" element={<Mentor />} />
      <Route path="/mentor-registration" element={<MentorRegistration />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/program" element={<Program />} />
      <Route path="/video" element={<Video />} />
    </Routes>
  );
}