import { BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AcademicRequirementsProps {
  gpa_expectations?: number;
  common_courses?: string[];
  degree_levels?: string[];
  affiliated_programs?: string[];
}

export function AcademicRequirements({ 
  gpa_expectations, 
  common_courses,
  degree_levels,
  affiliated_programs
}: AcademicRequirementsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-primary" />
        Academic Requirements
      </h4>
      
      {gpa_expectations && (
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary">Expected GPA: {gpa_expectations}</Badge>
        </div>
      )}

      {common_courses && common_courses.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Required Courses</h5>
          <div className="flex flex-wrap gap-2">
            {common_courses.map((course, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#FFDEE2] text-[#4B5563] border-[#FFD1D6]"
              >
                {course}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {degree_levels && degree_levels.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Degree Levels</h5>
          <div className="flex flex-wrap gap-2">
            {degree_levels.map((level, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#F2FCE2] text-[#4B5563]"
              >
                {level}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {affiliated_programs && affiliated_programs.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium">Affiliated Programs</h5>
          <div className="flex flex-wrap gap-2">
            {affiliated_programs.map((program, index) => (
              <Badge 
                key={index} 
                variant="outline"
                className="bg-[#D3E4FD] text-[#4B5563]"
              >
                {program}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}