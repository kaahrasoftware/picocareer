import { CustomSelect } from "./education/CustomSelect";
import { Input } from "@/components/ui/input";

interface Company {
  id: string;
  name: string;
}

interface ProfessionalSectionProps {
  position: string;
  companyId: string;
  yearsOfExperience: number;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  companies: Company[];
}

export function ProfessionalSection({
  position,
  companyId,
  yearsOfExperience,
  handleInputChange,
  handleSelectChange,
  companies,
}: ProfessionalSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Experience</h3>
      <div>
        <label className="text-sm font-medium">Position</label>
        <Input
          name="position"
          value={position}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="Current position"
        />
      </div>

      <CustomSelect
        value={companyId}
        options={companies}
        placeholder="Company"
        handleSelectChange={handleSelectChange}
        tableName="companies"
        fieldName="company_id"
        titleField="name"
      />

      <div>
        <label className="text-sm font-medium">Years of Experience</label>
        <Input
          name="years_of_experience"
          type="number"
          value={yearsOfExperience}
          onChange={handleInputChange}
          className="mt-1"
          min="0"
        />
      </div>
    </div>
  );
}