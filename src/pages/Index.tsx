import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { useEffect } from "react";
import Blog from "@/pages/Blog";
import { useLocation } from "react-router-dom";
import { MainLayout } from "@/components/MainLayout";

const Index = () => {
  const location = useLocation();
  const showBlog = location.hash === "#blog";

  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background text-foreground">
        <MenuSidebar />
        <MainLayout>
          {showBlog ? <Blog /> : <HeroSection />}
        </MainLayout>
      </div>
    </SidebarProvider>
  );
};

export default Index;