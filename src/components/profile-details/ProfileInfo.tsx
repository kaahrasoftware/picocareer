import { Building2, GraduationCap, MapPin } from "lucide-react";

interface ProfileInfoProps {
  careerTitle?: string | null;
  companyName?: string | null;
  schoolName?: string | null;
  location?: string | null;
  academicMajor?: string | null;
}

export function ProfileInfo({ careerTitle, companyName, schoolName, location, academicMajor }: ProfileInfoProps) {
  return (
    <div className="flex flex-col gap-1 mt-2">
      {careerTitle && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4 flex-shrink-0" />
          <span>{companyName || "No company set"}</span>
        </div>
      )}
      {schoolName && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="h-4 w-4 flex-shrink-0" />
          <span>{schoolName}</span>
        </div>
      )}
      {location && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4 flex-shrink-0" />
          <span>{location}</span>
        </div>
      )}
      {academicMajor && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <GraduationCap className="h-4 w-4 flex-shrink-0" />
          <span>{academicMajor}</span>
        </div>
      )}
    </div>
  );
}