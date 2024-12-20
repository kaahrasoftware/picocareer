import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Major } from "@/types/database/majors";
import type { School } from "@/types/database/schools";

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
  const degreeOptions = [
    "No Degree",
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "MD",
    "PhD"
  ] as const;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Education</h3>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Highest Degree</label>
          <Select 
            value={highestDegree} 
            onValueChange={(value) => handleSelectChange('highest_degree', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your highest degree" />
            </SelectTrigger>
            <SelectContent>
              {degreeOptions.map((degree) => (
                <SelectItem key={degree} value={degree}>
                  {degree}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Academic Major</label>
          <Select 
            value={academicMajorId} 
            onValueChange={(value) => handleSelectChange('academic_major_id', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your major" />
            </SelectTrigger>
            <SelectContent>
              {majors.map((major) => (
                <SelectItem key={major.id} value={major.id}>
                  {major.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <Select 
            value={schoolId} 
            onValueChange={(value) => handleSelectChange('school_id', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}