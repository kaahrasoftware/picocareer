import { UseFormRegister } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { FormFields } from "../types/form-types";
import { CustomSelect } from "../form-sections/education/CustomSelect";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PersonalSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  schoolId?: string;
}

export function PersonalSection({ register, handleFieldChange, schoolId }: PersonalSectionProps) {
  const { data: schools = [] } = useQuery({
    queryKey: ['schools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('status', 'Approved')
        .order('name');
      
      if (error) {
        console.error('Error fetching schools:', error);
        throw error;
      }
      
      return data || [];
    }
  });

  return (
    <div className="bg-muted rounded-lg p-4 space-y-4">
      <h4 className="font-semibold">Personal Information</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">First Name</label>
          <Input 
            {...register("first_name")}
            onChange={(e) => handleFieldChange("first_name", e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input 
            {...register("last_name")}
            onChange={(e) => handleFieldChange("last_name", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium">Location</label>
        <Input 
          {...register("location")}
          onChange={(e) => handleFieldChange("location", e.target.value)}
          placeholder="City, Country"
        />
      </div>
      <div>
        <CustomSelect
          value={schoolId || ''}
          options={schools}
          placeholder="School"
          handleSelectChange={(_, value) => handleFieldChange("school_id", value)}
          tableName="schools"
          fieldName="school_id"
          titleField="name"
        />
      </div>
    </div>
  );
}