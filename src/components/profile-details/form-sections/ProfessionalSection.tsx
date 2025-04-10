
import { EnhancedComboBox } from "@/components/common/EnhancedComboBox";
import { Input } from "@/components/ui/input";
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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Professional Experience</h3>

      <div>
        <label className="text-sm font-medium">Position</label>
        <EnhancedComboBox
          value={position}
          onValueChange={(value) => handleSelectChange("position", value)}
          placeholder="Select Position"
          tableName="careers"
          selectField="title"
          searchField="title"
          allowCustomValue={true}
          onCustomValueSubmit={async (value) => {
            try {
              const { data, error } = await supabase
                .from('careers')
                .insert({ 
                  title: value,
                  description: `Custom position: ${value}`,
                  status: 'Pending'
                })
                .select('id')
                .single();
              
              if (error) throw error;
              if (data) {
                handleSelectChange('position', data.id);
              }
            } catch (error) {
              console.error('Error adding custom position:', error);
            }
          }}
        />
      </div>

      <div>
        <label className="text-sm font-medium">Company</label>
        <EnhancedComboBox
          value={companyId}
          onValueChange={(value) => handleSelectChange("company_id", value)}
          placeholder="Select Company"
          tableName="companies"
          selectField="name"
          searchField="name"
          allowCustomValue={true}
          onCustomValueSubmit={async (value) => {
            try {
              const { data, error } = await supabase
                .from('companies')
                .insert({ 
                  name: value,
                  status: 'Pending'
                })
                .select('id')
                .single();
              
              if (error) throw error;
              if (data) {
                handleSelectChange('company_id', data.id);
              }
            } catch (error) {
              console.error('Error adding custom company:', error);
            }
          }}
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
