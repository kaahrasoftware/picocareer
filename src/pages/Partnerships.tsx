
import { PartnershipHeader } from "@/components/partnerships/PartnershipHeader";
import { PartnershipSteps } from "@/components/partnerships/PartnershipSteps";
import { PartnershipBenefits } from "@/components/partnerships/PartnershipBenefits";
import { PartnershipApplicationForm } from "@/components/partnerships/PartnershipApplicationForm";

export default function Partnerships() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-kahra-darker via-kahra-dark to-background">
      <div className="container mx-auto px-4 py-8 space-y-16">
        <PartnershipHeader />
        <PartnershipSteps />
        <PartnershipBenefits />
        <PartnershipApplicationForm />
      </div>
    </div>
  );
}
