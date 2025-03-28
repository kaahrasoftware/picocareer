
import { Briefcase, Building } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface ProfessionalSectionViewProps {
  profile: Profile & {
    company_name?: string | null;
  };
  careerTitle?: string | null;
}

export function ProfessionalSectionView({ profile, careerTitle }: ProfessionalSectionViewProps) {
  const hasProfessionalInfo = careerTitle || profile.company_name || profile.years_of_experience;

  if (!hasProfessionalInfo) {
    return (
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-4">Professional Experience</h4>
        <p className="text-muted-foreground text-sm">No professional experience provided yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Professional Experience</h4>
      
      <div className="space-y-4">
        {careerTitle && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span>{careerTitle}</span>
            </div>
          </div>
        )}

        {profile.company_name && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building className="h-4 w-4" />
              <span>{profile.company_name}</span>
            </div>
          </div>
        )}

        {profile.years_of_experience !== null && profile.years_of_experience !== undefined && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Years of Experience:</span>
              <span>{profile.years_of_experience}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
