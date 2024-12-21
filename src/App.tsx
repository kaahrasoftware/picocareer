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
          <Route path="/career-upload" element={<CareerUpload />} />
          <Route path="/major-upload" element={<MajorUpload />} />
          <Route path="/blog-upload" element={<BlogUpload />} />
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