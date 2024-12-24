import { CustomSelect } from "./education/CustomSelect";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
  // Fetch careers for the position select
  const { data: careers } = useQuery({
    queryKey: ['careers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data;
    }
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Experience</h3>

      <CustomSelect
        value={position}
        options={careers || []}
        placeholder="Select Position"
        handleSelectChange={handleSelectChange}
        tableName="careers"
        fieldName="position"
        titleField="title"
      />

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