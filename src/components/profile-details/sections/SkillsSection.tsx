import { Wrench, Tags, Lightbulb } from "lucide-react";
import { BadgeSection } from "@/components/career/BadgeSection";
import type { Profile } from "@/types/database/profiles";

interface SkillsSectionProps {
  profile: Profile;
}

export function SkillsSection({ profile }: SkillsSectionProps) {
  if (profile.user_type !== 'mentor') return null;

  return (
    <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
      <BadgeSection
        title="Skills"
        icon={<Wrench className="h-4 w-4" />}
        items={profile.skills}
        badgeClassName="text-xs sm:text-sm bg-[#F2FCE2] text-[#4B5563] hover:bg-[#E5F6D3] transition-colors border border-[#E2EFD9]"
      />

      <BadgeSection
        title="Tools"
        icon={<Wrench className="h-4 w-4" />}
        items={profile.tools_used}
        badgeClassName="text-xs sm:text-sm bg-[#D3E4FD] text-[#4B5563] hover:bg-[#C1D9F9] transition-colors border border-[#C1D9F9]"
      />

      <BadgeSection
        title="Keywords"
        icon={<Tags className="h-4 w-4" />}
        items={profile.keywords}
        badgeClassName="text-xs sm:text-sm bg-[#FDE2E2] text-[#4B5563] hover:bg-[#FACACA] transition-colors border border-[#FAD4D4]"
      />

      <BadgeSection
        title="Fields of Interest"
        icon={<Lightbulb className="h-4 w-4" />}
        items={profile.fields_of_interest}
        badgeClassName="text-xs sm:text-sm bg-[#E2D4F0] text-[#4B5563] hover:bg-[#D4C4E3] transition-colors border border-[#D4C4E3]"
      />
    </div>
  );
}