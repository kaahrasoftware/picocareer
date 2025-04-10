
import { Major } from "@/types/database/majors";
import { School } from "@/types/database/schools";
import { DegreeSelect } from "./education/DegreeSelect";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { supabase } from "@/integrations/supabase/client";

interface EducationSectionProps {
  highestDegree: string;
  academicMajorId: string;
  schoolId: string;
  handleSelectChange: (name: string, value: string) => void;
  majors: Pick<Major, 'id' | 'title'>[];
  schools: Pick<School, 'id' | 'name'>[];
}

export function EducationSection({
  highestDegree,
  academicMajorId,
  schoolId,
  handleSelectChange,
  majors,
  schools,
}: EducationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-4">
        <DegreeSelect 
          value={highestDegree}
          handleSelectChange={handleSelectChange}
        />

        <div>
          <label className="text-sm font-medium">Academic Major</label>
          <SearchableSelect
            value={academicMajorId}
            onValueChange={(value) => handleSelectChange('academic_major_id', value)}
            placeholder="Select Academic Major"
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
                  handleSelectChange('academic_major_id', data.id);
                }
              } catch (error) {
                console.error('Error adding custom major:', error);
              }
            }}
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <SearchableSelect
            value={schoolId}
            onValueChange={(value) => handleSelectChange('school_id', value)}
            placeholder="Select School"
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
                  handleSelectChange('school_id', data.id);
                }
              } catch (error) {
                console.error('Error adding custom school:', error);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
