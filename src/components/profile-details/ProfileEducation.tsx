import { Badge } from "@/components/ui/badge";
import { GraduationCap, School } from "lucide-react";
import { EditableField } from "@/components/profile/EditableField";

interface ProfileEducationProps {
  academic_major: string | null;
  highest_degree: string | null;
  school_name: string | null;
  profileId: string;
}

export function ProfileEducation({ academic_major, highest_degree, school_name, profileId }: ProfileEducationProps) {
  if (!academic_major && !highest_degree && !school_name) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Education</h4>
      
      <div className="flex items-center gap-2 text-muted-foreground">
        <GraduationCap className="h-4 w-4" />
        <EditableField
          label="Academic Major"
          value={academic_major}
          fieldName="academic_major"
          profileId={profileId}
        />
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <School className="h-4 w-4" />
        <EditableField
          label="School"
          value={school_name}
          fieldName="school_name"
          profileId={profileId}
        />
      </div>

      <div>
        <EditableField
          label="Highest Degree"
          value={highest_degree}
          fieldName="highest_degree"
          profileId={profileId}
        />
      </div>
    </div>
  );
}