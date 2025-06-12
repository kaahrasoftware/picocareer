
import { UseFormRegister } from "react-hook-form";
import { FormFields } from "../types/form-types";
import { Degree } from "@/types/database/enums";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { degreeOptions } from "@/constants/degrees";

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
  const majorOptions = majors.map(major => ({
    value: major.id,
    label: major.title
  }));

  const schoolOptions = schools.map(school => ({
    value: school.id,
    label: school.name
  }));

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
              {degreeOptions.map((degree) => (
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
            options={majorOptions}
            value={academicMajorId || ""}
            onValueChange={(value) => handleFieldChange("academic_major_id", value)}
            placeholder="Select Academic Major"
            searchPlaceholder="Search majors..."
            emptyMessage="No majors found."
          />
          <input
            type="hidden"
            {...register("academic_major_id")}
          />
        </div>

        <div>
          <label className="text-sm font-medium">School</label>
          <SearchableSelect
            options={schoolOptions}
            value={schoolId || ""}
            onValueChange={(value) => handleFieldChange("school_id", value)}
            placeholder="Select School"
            searchPlaceholder="Search schools..."
            emptyMessage="No schools found."
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
