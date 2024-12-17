import { Badge } from "@/components/ui/badge";
import { GraduationCap } from "lucide-react";

interface ProfileEducationProps {
  academic_major: string | null;
  highest_degree: string | null;
}

export function ProfileEducation({ academic_major, highest_degree }: ProfileEducationProps) {
  if (!academic_major && !highest_degree) return null;

  return (
    <div className="bg-muted rounded-lg p-4 space-y-3">
      <h4 className="font-semibold">Education</h4>
      {academic_major && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="h-4 w-4" />
          <span>{academic_major}</span>
        </div>
      )}
      {highest_degree && (
        <Badge variant="outline" className="mr-2">
          {highest_degree}
        </Badge>
      )}
    </div>
  );
}