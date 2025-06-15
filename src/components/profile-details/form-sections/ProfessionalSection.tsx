
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";

interface Company {
  id: string;
  name: string;
}

interface ProfessionalSectionProps {
  form: UseFormReturn<any>;
  companies?: Company[];
}

export function ProfessionalSection({
  form,
  companies = [],
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
          {...form.register("position")}
          placeholder="Enter your position"
          className="mt-1"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Company</label>
        <SearchableSelect
          options={companyOptions}
          value={form.watch("company_id")}
          onValueChange={(value) => form.setValue("company_id", value)}
          placeholder="Select Company"
          searchPlaceholder="Search companies..."
          emptyMessage="No companies found."
        />
      </div>

      <div>
        <label className="text-sm font-medium">Years of Experience</label>
        <Input
          {...form.register("years_of_experience")}
          type="number"
          className="mt-1"
          min="0"
        />
      </div>
    </div>
  );
}
