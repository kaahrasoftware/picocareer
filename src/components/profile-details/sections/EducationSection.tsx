
import { UseFormRegister } from "react-hook-form";
import { FormFields, Degree } from "../types/form-types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { supabase } from "@/integrations/supabase/client";

interface EducationSectionProps {
  register: UseFormRegister<FormFields>;
  handleFieldChange: (field: keyof FormFields, value: any) => void;
  schools: { id: string; name: string }[];
  majors: { id: string; title: string }[];
  schoolId?: string;
  academicMajorId?: string;
  highestDegree: Degree;
}

export function EducationSection({
  register,
  handleFieldChange,
  schools,
  majors,
  schoolId,
  academicMajorId,
  highestDegree,
}: EducationSectionProps) {
  const degrees: Degree[] = [
    "No Degree",
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "MD",
    "PhD"
  ];

  return (
    <div className="bg-muted rounded-lg p-4">
      <h4 className="font-semibold mb-4">Education</h4>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Highest Degree</label>
          <Select 
            value={highestDegree} 
            onValueChange={(value) => handleFieldChange("highest_degree", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select degree" />
            </SelectTrigger>
            <SelectContent>
              {degrees.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("highest_degree")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Academic Major</label>
          <SearchableSelect 
            value={academicMajorId || ""} 
            onValueChange={(value) => handleFieldChange("academic_major_id", value)}
            placeholder="Select academic major"
            tableName="majors"
            selectField="title"
            searchField="title"
            allowCustomValue={true}
            onCustomValueSubmit={async (value) => {
              try {
                const { data, error } = await supabase
                  .from('majors')
                  .insert({ 
                    title: value,
                    description: `Custom major: ${value}`,
                    status: 'Pending'
                  })
                  .select('id')
                  .single();
                
                if (error) throw error;
                if (data) {
                  handleFieldChange('academic_major_id', data.id);
                }
              } catch (error) {
                console.error('Error adding custom major:', error);
              }
            }}
          />
          <input
            type="hidden"
            {...register("academic_major_id")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <SearchableSelect 
            value={schoolId || ""} 
            onValueChange={(value) => handleFieldChange("school_id", value)}
            placeholder="Select school"
            tableName="schools"
            selectField="name"
            searchField="name"
            allowCustomValue={true}
            onCustomValueSubmit={async (value) => {
              try {
                const { data, error } = await supabase
                  .from('schools')
                  .insert({ 
                    name: value,
                    status: 'Pending'
                  })
                  .select('id')
                  .single();
                
                if (error) throw error;
                if (data) {
                  handleFieldChange('school_id', data.id);
                }
              } catch (error) {
                console.error('Error adding custom school:', error);
              }
            }}
          />
          <input
            type="hidden"
            {...register("school_id")}
          />
        </div>
      </div>
    </div>
  );
}
