import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { Input } from "@/components/ui/input";

export interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
  schoolId: string;
}

export function PersonalSection({ register, handleFieldChange, schoolId }: PersonalSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            {...register("first_name")}
            onChange={(e) => handleFieldChange("first_name", e.target.value)}
            className="mt-1"
            placeholder="Your first name"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            {...register("last_name")}
            onChange={(e) => handleFieldChange("last_name", e.target.value)}
            className="mt-1"
            placeholder="Your last name"
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">School</label>
        <Input
          value={schoolId}
          readOnly
          className="mt-1"
          placeholder="Your school"
        />
      </div>
    </div>
  );
}
