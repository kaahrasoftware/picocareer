
import { HeroSection } from "@/components/sections/HeroSection";
import { StatisticsSection } from "@/components/sections/StatisticsSection";
import { CallToActionSection } from "@/components/sections/CallToActionSection";
import { FeaturedCareersSection } from "@/components/sections/FeaturedCareersSection";
import { FeaturedMajorsSection } from "@/components/sections/FeaturedMajorsSection";
import { TopRatedMentorsSection } from "@/components/sections/TopRatedMentorsSection";
import { useEffect } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

const Index = () => {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);

  // Log profile data on the index page for debugging
  useEffect(() => {
    console.log("Index - Session:", session);
    console.log("Index - Profile:", profile);
    console.log("Index - Is mentor:", profile?.user_type === "mentor");
  }, [session, profile]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white">
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
