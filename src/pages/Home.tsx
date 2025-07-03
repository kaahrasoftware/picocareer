
import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedContentTabsSection } from '@/components/sections/FeaturedContentTabsSection';
import { AIAssessmentSection } from '@/components/sections/AIAssessmentSection';
import { TopRatedMentorsSection } from '@/components/sections/TopRatedMentorsSection';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { PartnershipsCTASection } from '@/components/sections/PartnershipsCTASection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedContentTabsSection />
      <AIAssessmentSection />
      <TopRatedMentorsSection />
      <StatisticsSection />
      <PartnershipsCTASection />
    </div>
  );
}
