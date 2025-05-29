
import { PartnershipHero } from "@/components/partnerships/PartnershipHero";
import { PartnershipTypes } from "@/components/partnerships/PartnershipTypes";
import { BenefitsOverview } from "@/components/partnerships/BenefitsOverview";
import { ProcessSteps } from "@/components/partnerships/ProcessSteps";
import { ApplicationFormSection } from "@/components/partnerships/ApplicationFormSection";

export default function Partnerships() {
  return (
    <div className="min-h-screen">
      <PartnershipHero />
      <BenefitsOverview />
      <PartnershipTypes />
      <ProcessSteps />
      <ApplicationFormSection />
    </div>
  );
}
