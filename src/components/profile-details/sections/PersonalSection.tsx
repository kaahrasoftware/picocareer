import { Profile } from "@/types/database/profiles";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

export interface PersonalSectionProps {
  profile: Profile;
  register?: UseFormRegister<FormFields>;
  handleFieldChange?: (fieldName: keyof FormFields, value: any) => void;
  schoolId?: string;
}

export function PersonalSection({ profile, register, handleFieldChange, schoolId }: PersonalSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <input
            type="text"
            {...register?.("first_name")}
            className="mt-1"
            placeholder="Your first name"
            defaultValue={profile.first_name || ""}
            onChange={(e) => handleFieldChange?.("first_name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <input
            type="text"
            {...register?.("last_name")}
            className="mt-1"
            placeholder="Your last name"
            defaultValue={profile.last_name || ""}
            onChange={(e) => handleFieldChange?.("last_name", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">School</label>
        <select
          {...register?.("school_id")}
          className="mt-1"
          defaultValue={schoolId || ""}
          onChange={(e) => handleFieldChange?.("school_id", e.target.value)}
        >
          <option value="" disabled>Select your school</option>
          {/* Add options dynamically based on available schools */}
        </select>
      </div>
    </div>
  );
}
