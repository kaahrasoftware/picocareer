
import React from 'react';
import { PartnershipsHero } from '@/components/partnerships/PartnershipsHero';
import { PartnershipTypes } from '@/components/partnerships/PartnershipTypes';
import { PartnershipProcess } from '@/components/partnerships/PartnershipProcess';
import { PartnershipBenefits } from '@/components/partnerships/PartnershipBenefits';
import { PartnershipCTA } from '@/components/partnerships/PartnershipCTA';

export default function Partnerships() {
  return (
    <div className="min-h-screen">
      <PartnershipsHero />
      <PartnershipTypes />
      <PartnershipBenefits />
      <PartnershipProcess />
      <PartnershipCTA />
    </div>
  );
}
