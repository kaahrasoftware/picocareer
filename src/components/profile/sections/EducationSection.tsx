import { EditableField } from "@/components/profile/EditableField";

interface EducationSectionProps {
  academicMajorId: string | null;
  highestDegree: string | null;
  profileId: string;
}

export function EducationSection({
  academicMajorId,
  highestDegree,
  profileId
}: EducationSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Education</h3>
      <div className="space-y-4">
        <EditableField
          label="Academic Major"
          value={academicMajorId}
          fieldName="academic_major_id"
          profileId={profileId}
          placeholder="Select your academic major"
        />
        <EditableField
          label="Highest Degree"
          value={highestDegree}
          fieldName="highest_degree"
          profileId={profileId}
          placeholder="Select your highest degree"
        />
      </div>
    </div>
  );
}