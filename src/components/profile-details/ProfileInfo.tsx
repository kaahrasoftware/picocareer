import { Building2, GraduationCap, MapPin } from "lucide-react";

interface ProfileInfoProps {
  careerTitle?: string | null;
  companyName?: string | null;
  schoolName?: string | null;
  location?: string | null;
  academicMajor?: string | null;
}

export function ProfileInfo({ 
  careerTitle, 
  companyName, 
  schoolName, 
  location, 
  academicMajor 
}: ProfileInfoProps) {
  // Helper function to render info item
  const renderInfoItem = (icon: React.ReactNode, text: string | null) => {
    if (!text) return null;
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="truncate">{text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1 mt-2">
      {renderInfoItem(<Building2 className="h-4 w-4 flex-shrink-0" />, careerTitle)}
      {renderInfoItem(<Building2 className="h-4 w-4 flex-shrink-0" />, companyName)}
      {renderInfoItem(<GraduationCap className="h-4 w-4 flex-shrink-0" />, schoolName)}
      {renderInfoItem(<GraduationCap className="h-4 w-4 flex-shrink-0" />, academicMajor)}
      {renderInfoItem(<MapPin className="h-4 w-4 flex-shrink-0" />, location)}
    </div>
  );
}