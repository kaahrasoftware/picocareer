import { EditableField } from "@/components/profile/EditableField";
import { Card } from "@/components/ui/card";

interface ProfessionalSectionProps {
  position: string | null;
  companyId: string | null;
  yearsOfExperience: number | null;
  profileId: string;
}

export function ProfessionalSection({
  position,
  companyId,
  yearsOfExperience,
  profileId
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
        />
        <EditableField
          label="Company"
          value={companyId}
          fieldName="company_id"
          profileId={profileId}
          placeholder="Select your company"
        />
        <EditableField
          label="Years of Experience"
          value={yearsOfExperience?.toString()}
          fieldName="years_of_experience"
          profileId={profileId}
          placeholder="Add your years of experience"
        />
      </div>
    </div>
  );
}