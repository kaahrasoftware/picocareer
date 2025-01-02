import { Routes, Route } from "react-router-dom";
import { MenuSidebar } from "@/components/MenuSidebar";
import About from "@/pages/About";
import Auth from "@/pages/Auth";
import Blog from "@/pages/Blog";
import BlogUpload from "@/pages/BlogUpload";
import Career from "@/pages/Career";
import CareerUpload from "@/pages/CareerUpload";
import Error from "@/pages/Error";
import Index from "@/pages/Index";
import MajorUpload from "@/pages/MajorUpload";
import Mentor from "@/pages/Mentor";
import MentorRegistration from "@/pages/MentorRegistration";
import Profile from "@/pages/Profile";
import Program from "@/pages/Program";
import Video from "@/pages/Video";

export default function AppRoutes() {
  return (
    <>
      <MenuSidebar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Index />} errorElement={<Error />} />
          <Route path="/about" element={<About />} errorElement={<Error />} />
          <Route path="/auth" element={<Auth />} errorElement={<Error />} />
          <Route path="/blog" element={<Blog />} errorElement={<Error />} />
          <Route path="/blog/upload" element={<BlogUpload />} errorElement={<Error />} />
          <Route path="/career" element={<Career />} errorElement={<Error />} />
          <Route path="/career/upload" element={<CareerUpload />} errorElement={<Error />} />
          <Route path="/major/upload" element={<MajorUpload />} errorElement={<Error />} />
          <Route path="/mentor" element={<Mentor />} errorElement={<Error />} />
          <Route path="/mentor/register" element={<MentorRegistration />} errorElement={<Error />} />
          <Route path="/profile" element={<Profile />} errorElement={<Error />} />
          <Route path="/program" element={<Program />} errorElement={<Error />} />
          <Route path="/video" element={<Video />} errorElement={<Error />} />
          <Route path="*" element={<Error />} />
        </Routes>
      </main>
    </>
  );
}