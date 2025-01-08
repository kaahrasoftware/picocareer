import { BookOpen, GraduationCap } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface EducationSectionProps {
  profile: Profile & {
    school_name?: string | null;
    academic_major?: string | null;
  };
}

export function EducationSection({ profile }: EducationSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-3 sm:p-4 w-full">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <GraduationCap className="h-4 w-4" />
        <h4 className="font-semibold text-sm sm:text-base">Education</h4>
      </div>
      <div className="space-y-2 sm:space-y-3">
        {profile.academic_major && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Major</p>
            <p className="flex items-center gap-2 text-sm sm:text-base">
              <BookOpen className="h-4 w-4" />
              {profile.academic_major}
            </p>
          </div>
        )}
        {profile.highest_degree && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">Degree</p>
            <p className="flex items-center gap-2 text-sm sm:text-base">
              <GraduationCap className="h-4 w-4" />
              {profile.highest_degree}
            </p>
          </div>
        )}
        {profile.school_name && (
          <div>
            <p className="text-xs sm:text-sm text-muted-foreground">School</p>
            <p className="flex items-center gap-2 text-sm sm:text-base">
              <GraduationCap className="h-4 w-4" />
              {profile.school_name}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}