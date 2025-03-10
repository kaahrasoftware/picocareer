
import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";

const Index = () => {
  const { session } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

  // Set dark theme by default
  useEffect(() => {
    try {
      document.documentElement.classList.add("dark");
    } catch (error) {
      console.error("Error setting dark theme:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="w-full px-8 sm:px-12 lg:px-16 py-8">
          <div className="w-full max-w-7xl mx-auto space-y-8">
            <HeroSection />
            <StatisticsSection />
            <CallToActionSection />
            <TopRatedMentorsSection />
            <FeaturedCareersSection />
            <FeaturedMajorsSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
