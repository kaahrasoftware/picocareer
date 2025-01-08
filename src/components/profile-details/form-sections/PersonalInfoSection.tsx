import { FormField } from "@/components/forms/FormField";
import { Card } from "@/components/ui/card";
import { Control } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { UseFormRegister } from "react-hook-form";

export interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
  schoolId: string;
}

export function PersonalInfoSection({ register, handleFieldChange, schoolId }: PersonalSectionProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          control={register}
          name="first_name"
          render={({ field }) => (
            <div>
              <label className="text-sm font-medium">First Name</label>
              <input
                {...field}
                onChange={(e) => handleFieldChange("first_name", e.target.value)}
                className="mt-1"
                placeholder="Your first name"
              />
            </div>
          )}
        />
        <FormField
          control={register}
          name="last_name"
          render={({ field }) => (
            <div>
              <label className="text-sm font-medium">Last Name</label>
              <input
                {...field}
                onChange={(e) => handleFieldChange("last_name", e.target.value)}
                className="mt-1"
                placeholder="Your last name"
              />
            </div>
          )}
        />
        <FormField
          control={register}
          name="school_id"
          render={({ field }) => (
            <div>
              <label className="text-sm font-medium">School</label>
              <select
                {...field}
                onChange={(e) => handleFieldChange("school_id", e.target.value)}
                className="mt-1"
              >
                <option value="">Select your school</option>
                {/* Add options dynamically based on available schools */}
              </select>
            </div>
          )}
        />
      </div>
    </Card>
  );
}
