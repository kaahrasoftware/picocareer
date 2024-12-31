import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/profile/editable/fields/SelectField";
import { UseFormRegister, UseFormWatch } from "react-hook-form";
import { FormFields } from "../types";

interface ProfessionalSectionProps {
  register: UseFormRegister<FormFields>;
  watch: UseFormWatch<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
  isMentor: boolean;
}

export function ProfessionalSection({ register, watch, handleFieldChange, isMentor }: ProfessionalSectionProps) {
  if (!isMentor) return null;

  const watchedFields = watch();

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Professional Information</h4>
      <div>
        <label className="text-sm font-medium">Current Position</label>
        <SelectField
          fieldName="position"
          value={watchedFields.position}
          onSave={(value) => handleFieldChange("position", value)}
          onCancel={() => {}}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Company</label>
        <SelectField
          fieldName="company_id"
          value={watchedFields.company_id}
          onSave={(value) => handleFieldChange("company_id", value)}
          onCancel={() => {}}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Years of Experience</label>
        <Input
          type="number"
          {...register("years_of_experience")}
          onChange={(e) => handleFieldChange("years_of_experience", parseInt(e.target.value))}
          min="0"
        />
      </div>
    </div>
  );
}