import { Badge } from "@/components/ui/badge";
import { GraduationCap, School } from "lucide-react";

interface ProfileEducationProps {
  academic_major: string | null;
  highest_degree: string | null;
  school_name: string | null;
}

export function ProfileEducation({ academic_major, highest_degree, school_name }: ProfileEducationProps) {
  if (!academic_major && !highest_degree && !school_name) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Education</h4>
      {academic_major && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{academic_major}</span>
        </div>
      )}
      {school_name && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <School className="h-4 w-4" />
          <span>{school_name}</span>
        </div>
      )}
      {highest_degree && (
        <Badge 
          variant="outline" 
          className="mr-2 bg-picocareer-primary/10 text-picocareer-primary border-picocareer-primary/20 hover:bg-picocareer-primary/20"
        >
          {highest_degree}
        </Badge>
      )}
    </div>
  );
}