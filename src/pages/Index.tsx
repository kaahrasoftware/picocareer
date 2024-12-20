import { SidebarProvider } from "@/components/ui/sidebar";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect } from "react";

export default function Index() {
  // Set dark theme by default
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <SidebarProvider>
      <div className="app-layout">
        <div className="main-content">
          <div className="w-full px-8 sm:px-12 lg:px-16 py-8">
            <div className="w-full max-w-7xl mx-auto space-y-8">
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
}