import { Badge } from "@/components/ui/badge";
import { GraduationCap, School } from "lucide-react";
import { EditableField } from "@/components/profile/EditableField";

interface ProfileEducationProps {
  academic_major: string | null;
  highest_degree: string | null;
  school_name: string | null;
  profileId: string;
}

export function ProfileEducation({ 
  academic_major, 
  highest_degree, 
  school_name, 
  profileId 
}: ProfileEducationProps) {
  const hasEducationInfo = academic_major || highest_degree || school_name;

  if (!hasEducationInfo) {
    return (
      <div className="bg-muted rounded-lg p-6 shadow-sm">
        <h4 className="font-semibold mb-4">Education</h4>
        <p className="text-muted-foreground text-sm">No education information provided yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h4 className="font-semibold mb-6">Education</h4>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <GraduationCap className="h-4 w-4" />
            <EditableField
              label="Academic Major"
              value={academic_major}
              fieldName="academic_major_id"
              profileId={profileId}
              placeholder="Add your major"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <School className="h-4 w-4" />
            <EditableField
              label="School"
              value={school_name}
              fieldName="school_id"
              profileId={profileId}
              placeholder="Add your school"
            />
          </div>
        </div>

        <div className="space-y-2">
          <EditableField
            label="Highest Degree"
            value={highest_degree}
            fieldName="highest_degree"
            profileId={profileId}
            placeholder="Add your highest degree"
          />
        </div>
      </div>
    </div>
  );
}