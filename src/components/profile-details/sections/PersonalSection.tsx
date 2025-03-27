
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  schoolId?: string;
}

export function PersonalSection({ 
  register, 
  handleFieldChange,
  schoolId
}: PersonalSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Personal Information</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input
            {...register("first_name")}
            onChange={(e) => handleFieldChange("first_name", e.target.value)}
            className="mt-1"
            placeholder="First name"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input
            {...register("last_name")}
            onChange={(e) => handleFieldChange("last_name", e.target.value)}
            className="mt-1"
            placeholder="Last name"
          />
        </div>
      </div>
    </div>
  );
}
