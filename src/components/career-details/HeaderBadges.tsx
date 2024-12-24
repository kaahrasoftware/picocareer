import { Badge } from "@/components/ui/badge";
import { Users, DollarSign } from "lucide-react";
import { badgeStyles } from "./BadgeStyles";

interface HeaderBadgesProps {
  profilesCount: number;
  salaryRange?: string;
}

export function HeaderBadges({ profilesCount, salaryRange }: HeaderBadgesProps) {
  return (
    <>
      <Badge 
        variant="secondary" 
        className="absolute top-0 right-0 flex items-center gap-1.5 bg-[#E5DEFF] hover:bg-[#D8D1F2] text-[#4B5563] transition-colors border border-[#D8D1F2] px-3 py-1 rounded-full shadow-sm"
      >
        <Users className="h-4 w-4" />
        <span className="font-medium">{profilesCount || 0} mentors</span>
      </Badge>
      
      {salaryRange && (
        <div className="flex items-center gap-1">
          <Badge 
            variant="outline"
            className={badgeStyles.outline}
          >
            <DollarSign className="h-4 w-4" />
            {salaryRange}
          </Badge>
        </div>
      )}
    </>
  );
}