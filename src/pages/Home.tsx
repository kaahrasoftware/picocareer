
import React from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedCareersSection } from '@/components/sections/FeaturedCareersSection';
import { TopRatedMentorsSection } from '@/components/sections/TopRatedMentorsSection';
import { FeaturedMajorsSection } from '@/components/sections/FeaturedMajorsSection';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { CallToActionSection } from '@/components/sections/CallToActionSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturedCareersSection />
      <TopRatedMentorsSection />
      <FeaturedMajorsSection />
      <StatisticsSection />
      <CallToActionSection />
    </div>
  );
}
