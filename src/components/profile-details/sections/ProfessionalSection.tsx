import { Briefcase, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types/database/profiles";

interface ProfessionalSectionProps {
  profile: Profile & {
    company_name?: string | null;
  };
  careerTitle?: string | null;
}

export function ProfessionalSection({ profile, careerTitle }: ProfessionalSectionProps) {
  if (profile.user_type !== 'mentor') return null;

  return (
    <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-3 sm:space-y-4 w-full">
      <div className="flex items-center gap-2 mb-1 sm:mb-2">
        <Briefcase className="h-4 w-4" />
        <h4 className="font-semibold text-sm sm:text-base">Professional Information</h4>
      </div>
      <div className="space-y-2 sm:space-y-3">
        <div>
          <p className="text-xs sm:text-sm text-muted-foreground">Position</p>
          <p className="text-sm sm:text-base">{careerTitle || "None"}</p>
        </div>
        {profile.company_name && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Company</p>
            <p className="text-sm sm:text-base">{profile.company_name}</p>
          </div>
        )}
        {profile.years_of_experience !== undefined && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Years of Experience</p>
            <p className="text-sm sm:text-base">{profile.years_of_experience}</p>
          </div>
        )}
        {profile.location && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Location</p>
            <p className="text-sm sm:text-base">{profile.location}</p>
          </div>
        )}
        {profile.languages && profile.languages.length > 0 && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Languages</p>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-1">
              {profile.languages.map((language, index) => (
                <Badge 
                  key={`${language}-${index}`}
                  className="text-xs sm:text-sm bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] transition-colors border border-[#A5D6A7]"
                >
                  {language}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}