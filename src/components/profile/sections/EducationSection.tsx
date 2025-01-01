import { EditableField } from "@/components/profile/EditableField";

interface EducationSectionProps {
  academicMajorId: string | null;
  highestDegree: string | null;
  schoolId: string | null;
  profileId: string;
  isEditing: boolean;
}

export function EducationSection({
  academicMajorId,
  highestDegree,
  schoolId,
  profileId,
  isEditing
}: EducationSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Education</h3>
      <div className="space-y-4">
        <EditableField
          label="School"
          value={schoolId}
          fieldName="school_id"
          profileId={profileId}
          placeholder="Select your school"
          isEditing={isEditing}
        />
        <EditableField
          label="Academic Major"
          value={academicMajorId}
          fieldName="academic_major_id"
          profileId={profileId}
          placeholder="Select your academic major"
          isEditing={isEditing}
        />
        <EditableField
          label="Highest Degree"
          value={highestDegree}
          fieldName="highest_degree"
          profileId={profileId}
          placeholder="Select your highest degree"
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}