
import { Textarea } from "@/components/ui/textarea";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";

interface BioSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
}

export function BioSection({ register, handleFieldChange }: BioSectionProps) {
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-2">About</h4>
      <Textarea
        {...register("bio")}
        onChange={(e) => handleFieldChange("bio", e.target.value)}
        placeholder="Tell us about yourself..."
        className="min-h-[100px]"
      />
    </div>
  );
}
