
import { Badge } from "@/components/ui/badge";
import { GraduationCap, School } from "lucide-react";
import type { Profile } from "@/types/database/profiles";

interface EducationSectionViewProps {
  profile: Profile & {
    school_name?: string | null;
    academic_major?: string | null;
  };
}

export function EducationSectionView({ profile }: EducationSectionViewProps) {
  const hasEducationInfo = profile.academic_major || profile.highest_degree || profile.school_name;

  if (!hasEducationInfo) {
    return (
      <div className="bg-muted rounded-lg p-4">
        <h4 className="font-semibold mb-4">Education</h4>
        <p className="text-muted-foreground text-sm">No education information provided yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Education</h4>
      
      <div className="space-y-4">
        {profile.academic_major && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4" />
              <span>{profile.academic_major}</span>
            </div>
          </div>
        )}

        {profile.school_name && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <School className="h-4 w-4" />
              <span>{profile.school_name}</span>
            </div>
          </div>
        )}

        {profile.highest_degree && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-medium">Highest Degree:</span>
              <span>{profile.highest_degree}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
