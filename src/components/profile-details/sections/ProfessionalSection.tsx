
import { Input } from "@/components/ui/input";
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Company {
  id: string;
  name: string;
}

interface ProfessionalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  companyId?: string;
  position?: string;
  yearsOfExperience: number;
  companies: Company[];
}

export function ProfessionalSection({
  register,
  handleFieldChange,
  companyId,
  position,
  yearsOfExperience,
  companies,
}: ProfessionalSectionProps) {
  // Fetch careers for the position select
  const { data: careers = [] } = useQuery({
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
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Professional Experience</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Position</label>
          <Select 
            value={position} 
            onValueChange={(value) => handleFieldChange("position", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              {careers.map((career) => (
                <SelectItem key={career.id} value={career.id}>
                  {career.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("position")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Company</label>
          <Select 
            value={companyId} 
            onValueChange={(value) => handleFieldChange("company_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
