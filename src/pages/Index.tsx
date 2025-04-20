import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { AIAssessmentSection } from "@/components/sections/AIAssessmentSection";
import { ResourcesHighlightSection } from "@/components/sections/ResourcesHighlightSection";
import { useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { WelcomeDialog } from "@/components/guide/WelcomeDialog";
import { Slides } from "@/components/Slides";

const Index = () => {
  const { session } = useAuthSession();
  const [isLoading, setIsLoading] = useState(true);

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
          <div className="w-full max-w-7xl mx-auto space-y-16">
            <HeroSection />
            <StatisticsSection />
            <AIAssessmentSection />
            <section className="mb-24">
              <Slides />
            </section>
            <ResourcesHighlightSection />
            <CallToActionSection />
            <div className="TopRatedMentorsSection">
              <TopRatedMentorsSection />
            </div>
            <div className="FeaturedCareersSection">
              <FeaturedCareersSection />
            </div>
            <FeaturedMajorsSection />
          </div>
        </div>
      </div>
      
      <WelcomeDialog />
    </div>
  );
};

export default Index;
