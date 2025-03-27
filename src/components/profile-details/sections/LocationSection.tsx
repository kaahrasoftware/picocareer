
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

interface LocationSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
}

export function LocationSection({ 
  register, 
  handleFieldChange
}: LocationSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Location</h4>
      
      <div>
        <label className="text-sm font-medium">Location</label>
        <Input
          {...register("location")}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          className="mt-1"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}
