
import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { ResourcesHighlightSection } from '@/components/sections/ResourcesHighlightSection';
import { FeaturedCareersSection } from '@/components/sections/FeaturedCareersSection';
import { FeaturedMajorsSection } from '@/components/sections/FeaturedMajorsSection';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { TopRatedMentorsSection } from '@/components/sections/TopRatedMentorsSection';
import { CallToActionSection } from '@/components/sections/CallToActionSection';

const Index = () => {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ResourcesHighlightSection />
      <FeaturedCareersSection />
      <FeaturedMajorsSection />
      <StatisticsSection />
      <TopRatedMentorsSection />
      <CallToActionSection />
    </div>
  );
};

export default Index;
