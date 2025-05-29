
import { SearchableSelect } from "@/components/common/SearchableSelect";
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
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Experience</h3>

      <div>
        <label className="text-sm font-medium">Position</label>
        <Input
          value={position}
          onChange={(e) => handleSelectChange("position", e.target.value)}
          placeholder="Enter your position"
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Company</label>
        <SearchableSelect
          options={companyOptions}
          value={companyId}
          onValueChange={(value) => handleSelectChange("company_id", value)}
          placeholder="Select Company"
          searchPlaceholder="Search companies..."
          emptyMessage="No companies found."
        />
      </div>

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
