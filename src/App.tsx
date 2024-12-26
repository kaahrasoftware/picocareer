import { useLocation } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import { MenuSidebar } from '@/components/MenuSidebar';
import { Footer } from '@/components/Footer';
import { GoToTopButton } from '@/components/ui/go-to-top-button';
import Index from '@/pages/Index';
import Blog from '@/pages/Blog';
import Mentor from '@/pages/Mentor';
import Career from '@/pages/Career';
import CareerUpload from '@/pages/CareerUpload';
import MajorUpload from '@/pages/MajorUpload';
import BlogUpload from '@/pages/BlogUpload';
import Program from '@/pages/Program';
import Video from '@/pages/Video';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import MentorRegistration from '@/pages/MentorRegistration';

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
          <Route path="/career-upload" element={<CareerUpload />} />
          <Route path="/major-upload" element={<MajorUpload />} />
          <Route path="/blog-upload" element={<BlogUpload />} />
          <Route path="/program" element={<Program />} />
          <Route path="/video" element={<Video />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mentor-registration" element={<MentorRegistration />} />
        </Routes>
      </main>
      {!isVideoPage && !isAuthPage && <Footer />}
      {!isVideoPage && !isAuthPage && <GoToTopButton />}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}