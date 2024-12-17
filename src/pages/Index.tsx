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
          <div className="w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center">
            <div className="w-full max-w-6xl space-y-8">
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