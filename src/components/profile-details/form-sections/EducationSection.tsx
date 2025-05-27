
import { Major } from "@/types/database/majors";
import { School } from "@/types/database/schools";
import { DegreeSelect } from "./education/DegreeSelect";
import { SearchableSelect } from "@/components/common/SearchableSelect";

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
  const majorOptions = majors.map(major => ({
    value: major.id,
    label: major.title
  }));

  const schoolOptions = schools.map(school => ({
    value: school.id,
    label: school.name
  }));

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
            options={majorOptions}
            value={academicMajorId}
            onValueChange={(value) => handleSelectChange('academic_major_id', value)}
            placeholder="Select Academic Major"
            searchPlaceholder="Search majors..."
            emptyMessage="No majors found."
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <SearchableSelect
            options={schoolOptions}
            value={schoolId}
            onValueChange={(value) => handleSelectChange('school_id', value)}
            placeholder="Select School"
            searchPlaceholder="Search schools..."
            emptyMessage="No schools found."
          />
        </div>
      </div>
    </div>
  );
}
