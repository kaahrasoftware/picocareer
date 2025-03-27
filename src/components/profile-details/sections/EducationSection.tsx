
import { UseFormRegister } from "react-hook-form";
import { FormFields, Degree } from "../types/form-types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
          <Select 
            value={academicMajorId} 
            onValueChange={(value) => handleFieldChange("academic_major_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select academic major" />
            </SelectTrigger>
            <SelectContent>
              {majors.map((major) => (
                <SelectItem key={major.id} value={major.id}>
                  {major.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("academic_major_id")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <Select 
            value={schoolId} 
            onValueChange={(value) => handleFieldChange("school_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            type="hidden"
            {...register("school_id")}
          />
        </div>
      </div>
    </div>
  );
}
