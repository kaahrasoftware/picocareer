import { useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MenuSidebar } from "@/components/MenuSidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";

const Index = () => {
  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <MenuSidebar />
        <div className="main-content">
          <div className="w-full px-8 sm:px-12 lg:px-16 py-8">
            <div className="w-full max-w-7xl mx-auto space-y-8">
              <HeroSection />
              <StatisticsSection />
              <CallToActionSection />
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