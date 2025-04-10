
import { Major } from "@/types/database/majors";
import { School } from "@/types/database/schools";
import { DegreeSelect } from "./education/DegreeSelect";
import { CustomSelect } from "./education/CustomSelect";
import { useAllSchools } from "@/hooks/useAllReferenceData";

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
  // Get full list of schools (this will use the paginated approach)
  const { data: allSchools } = useAllSchools();

  // Use the comprehensive school list if available, otherwise use the provided schools
  const schoolOptions = allSchools || schools;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-4">
        <DegreeSelect 
          value={highestDegree}
          handleSelectChange={handleSelectChange}
        />

        <CustomSelect
          value={academicMajorId}
          options={majors}
          placeholder="Academic Major"
          handleSelectChange={handleSelectChange}
          tableName="majors"
          fieldName="academic_major_id"
          titleField="title"
        />

        <CustomSelect
          value={schoolId}
          options={schoolOptions}
          placeholder="School"
          handleSelectChange={handleSelectChange}
          tableName="schools"
          fieldName="school_id"
          titleField="name"
        />
      </div>
    </div>
  );
}
