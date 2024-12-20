import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

      <div>
        <label className="text-sm font-medium">Company</label>
        <Select 
          value={companyId} 
          onValueChange={(value) => handleSelectChange('company_id', value)}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select your company" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((company) => (
              <SelectItem key={company.id} value={company.id}>
                {company.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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