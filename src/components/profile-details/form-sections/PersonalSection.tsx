import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types";

interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (fieldName: keyof FormFields, value: any) => void;
}

export function PersonalSection({ register, handleFieldChange }: PersonalSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Personal Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input 
            {...register("first_name")}
            onChange={(e) => handleFieldChange("first_name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input 
            {...register("last_name")}
            onChange={(e) => handleFieldChange("last_name", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Location</label>
        <Input 
          {...register("location")}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}