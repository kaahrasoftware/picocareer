
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { EnhancedComboBox } from "@/components/common/EnhancedComboBox";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Professional Experience</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Position</label>
          <EnhancedComboBox
            value={position || ""}
            onValueChange={(value) => handleFieldChange("position", value)}
            placeholder="Select position"
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
                  handleFieldChange('position', data.id);
                }
              } catch (error) {
                console.error('Error adding custom position:', error);
              }
            }}
          />
          <input
            type="hidden"
            {...register("position")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Company</label>
          <EnhancedComboBox
            value={companyId || ""}
            onValueChange={(value) => handleFieldChange("company_id", value)}
            placeholder="Select company"
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
                  handleFieldChange('company_id', data.id);
                }
              } catch (error) {
                console.error('Error adding custom company:', error);
              }
            }}
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
