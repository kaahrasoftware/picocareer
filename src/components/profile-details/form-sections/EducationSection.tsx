import { SelectField } from "@/components/profile/editable/fields/SelectField";
import { UseFormWatch } from "react-hook-form";
import { FormFields } from "../types";

interface EducationSectionProps {
  watch: UseFormWatch<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
  isMentor: boolean;
}

export function EducationSection({ watch, handleFieldChange, isMentor }: EducationSectionProps) {
  if (!isMentor) return null;

  const watchedFields = watch();

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Education</h4>
      <div>
        <label className="text-sm font-medium">School</label>
        <SelectField
          fieldName="school_id"
          value={watchedFields.school_id}
          onSave={(value) => handleFieldChange("school_id", value)}
          onCancel={() => {}}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Academic Major</label>
        <SelectField
          fieldName="academic_major_id"
          value={watchedFields.academic_major_id}
          onSave={(value) => handleFieldChange("academic_major_id", value)}
          onCancel={() => {}}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Highest Degree</label>
        <SelectField
          fieldName="highest_degree"
          value={watchedFields.highest_degree}
          onSave={(value) => handleFieldChange("highest_degree", value)}
          onCancel={() => {}}
        />
      </div>
    </div>
  );
}