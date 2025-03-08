
import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect } from "react";

const Index = () => {
  // Set dark theme by default
  useEffect(() => {
    try {
      document.documentElement.classList.add("dark");
    } catch (error) {
      console.error("Error setting dark theme:", error);
    }
  }, []);

  return (
    <div className="w-full">
      <div className="w-full px-4 sm:px-8 lg:px-12 py-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <HeroSection />
          <StatisticsSection />
          <CallToActionSection />
          <TopRatedMentorsSection />
          <FeaturedCareersSection />
          <FeaturedMajorsSection />
        </div>
      </div>
    </div>
  );
};

export default Index;
