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
  // Helper function to render info item with icon
  const renderInfoItem = (icon: React.ReactNode, text: string | null) => {
    if (!text) return null;
    return (
      <div className="flex items-start gap-2 text-muted-foreground">
        <span className="flex-shrink-0 mt-1">{icon}</span>
        <span className="text-sm sm:text-base break-words line-clamp-2">{text}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Career Information */}
      {renderInfoItem(
        <Building2 className="h-4 w-4 flex-shrink-0" />, 
        careerTitle
      )}
      {renderInfoItem(
        <Building2 className="h-4 w-4 flex-shrink-0" />, 
        companyName
      )}
      
      {/* Academic Information */}
      {renderInfoItem(
        <GraduationCap className="h-4 w-4 flex-shrink-0" />, 
        schoolName
      )}
      {renderInfoItem(
        <GraduationCap className="h-4 w-4 flex-shrink-0" />, 
        academicMajor
      )}
      
      {/* Location Information */}
      {renderInfoItem(
        <MapPin className="h-4 w-4 flex-shrink-0" />, 
        location
      )}
    </div>
  );
}