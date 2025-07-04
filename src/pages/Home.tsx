
import React from 'react';
import { ModernHeroSection } from '@/components/sections/ModernHeroSection';
import { QuickDiscoverySection } from '@/components/sections/QuickDiscoverySection';
import { FeaturedContentHubSection } from '@/components/sections/FeaturedContentHubSection';
import { TopRatedMentorsSection } from '@/components/sections/TopRatedMentorsSection';
import { StatisticsSection } from '@/components/sections/StatisticsSection';
import { PartnershipsCTASection } from '@/components/sections/PartnershipsCTASection';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <ModernHeroSection />
      <QuickDiscoverySection />
      <FeaturedContentHubSection />
      <TopRatedMentorsSection />
      <StatisticsSection />
      <PartnershipsCTASection />
    </div>
  );
}
