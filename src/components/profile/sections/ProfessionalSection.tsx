import { EditableField } from "@/components/profile/EditableField";

interface ProfessionalSectionProps {
  position: string | null;
  companyId: string | null;
  yearsOfExperience: number | null;
  profileId: string;
  isEditing?: boolean;
}

export function ProfessionalSection({
  position,
  companyId,
  yearsOfExperience,
  profileId,
  isEditing = true
}: ProfessionalSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Professional Information</h3>
      <div className="space-y-4">
        <EditableField
          label="Position"
          value={position}
          fieldName="position"
          profileId={profileId}
          placeholder="Add your position"
          isEditing={isEditing}
        />
        <EditableField
          label="Company"
          value={companyId}
          fieldName="company_id"
          profileId={profileId}
          placeholder="Select your company"
          isEditing={isEditing}
        />
        <EditableField
          label="Years of Experience"
          value={yearsOfExperience?.toString()}
          fieldName="years_of_experience"
          profileId={profileId}
          placeholder="Add your years of experience"
          isEditing={isEditing}
        />
      </div>
    </div>
  );
}