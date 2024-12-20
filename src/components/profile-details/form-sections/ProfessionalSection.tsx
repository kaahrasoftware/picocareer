import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [showCustomCompany, setShowCustomCompany] = useState(false);
  const [customCompany, setCustomCompany] = useState("");
  const { toast } = useToast();

  const handleCustomCompanySubmit = async () => {
    try {
      const { data, error } = await supabase
        .from('companies')
        .insert([
          { 
            name: customCompany,
          }
        ])
        .select('id, name')
        .single();

      if (error) throw error;

      if (data) {
        handleSelectChange('company_id', data.id);
        setShowCustomCompany(false);
        setCustomCompany("");
        toast({
          title: "Success",
          description: "New company added successfully",
        });
      }
    } catch (error: any) {
      if (error?.code === '23505') { // Unique violation
        toast({
          title: "Error",
          description: "This company already exists. Please select it from the list.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add new company",
          variant: "destructive",
        });
      }
    }
  };

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
        {!showCustomCompany ? (
          <Select 
            value={companyId} 
            onValueChange={(value) => {
              if (value === "other") {
                setShowCustomCompany(true);
              } else {
                handleSelectChange('company_id', value);
              }
            }}
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
              <SelectItem value="other">Other (Add New)</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <div className="space-y-2">
            <Input
              value={customCompany}
              onChange={(e) => setCustomCompany(e.target.value)}
              placeholder="Enter company name"
              className="mt-1"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCustomCompanySubmit}
                className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowCustomCompany(false)}
                className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
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