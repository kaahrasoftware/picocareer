
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Input } from "@/components/ui/input";

interface ProfessionalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  position?: string;
  companyId?: string;
  yearsOfExperience: number;
  companies: { id: string; name: string }[];
}

export function ProfessionalSection({
  register,
  handleFieldChange,
  position,
  companyId,
  yearsOfExperience,
  companies,
}: ProfessionalSectionProps) {
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Professional Experience</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Position</label>
          <Input
            value={position || ""}
            onChange={(e) => handleFieldChange("position", e.target.value)}
            placeholder="Enter your position"
            className="mt-1"
          />
          <input
            type="hidden"
            {...register("position")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Company</label>
          <SearchableSelect
            options={companyOptions}
            value={companyId || ""}
            onValueChange={(value) => handleFieldChange("company_id", value)}
            placeholder="Select Company"
            searchPlaceholder="Search companies..."
            emptyMessage="No companies found."
          />
          <input
            type="hidden"
            {...register("company_id")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Years of Experience</label>
          <Input
            {...register("years_of_experience", { valueAsNumber: true })}
            onChange={(e) => handleFieldChange("years_of_experience", parseInt(e.target.value) || 0)}
            className="mt-1"
            type="number"
            min="0"
          />
        </div>
      </div>
    </div>
  );
}
