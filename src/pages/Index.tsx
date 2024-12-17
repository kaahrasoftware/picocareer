import { SidebarProvider } from "@/components/ui/sidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect } from "react";

const Index = () => {
  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <div className="main-content">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="max-w-6xl mx-auto space-y-8">
              <HeroSection />
              <FeaturedCareersSection />
              <FeaturedMajorsSection />
              <TopRatedMentorsSection />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;