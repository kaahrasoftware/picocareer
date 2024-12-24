import { Book } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { badgeStyles } from "./BadgeStyles";

interface AcademicMajorsSectionProps {
  academicMajors?: string[];
}

export function AcademicMajorsSection({ academicMajors }: AcademicMajorsSectionProps) {
  if (!academicMajors?.length) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
        <Book className="h-5 w-5 text-primary" />
        Academic Majors
      </h3>
      <div className="flex flex-wrap gap-2">
        {academicMajors.map((major, index) => (
          <Badge 
            key={index}
            className={badgeStyles.primary}
          >
            {major}
          </Badge>
        ))}
      </div>
    </div>
  );
}