import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Heart } from "lucide-react";
import { badgeStyles } from "./BadgeStyles";

interface HeaderBadgesProps {
  profilesCount: number;
  salaryRange?: string;
  isBookmarked?: boolean;
  onBookmarkToggle?: () => void;
  showMentorBadgeOnly?: boolean;
  showSalaryBadgeOnly?: boolean;
}

export function HeaderBadges({ 
  profilesCount, 
  salaryRange, 
  isBookmarked, 
  onBookmarkToggle,
  showMentorBadgeOnly,
  showSalaryBadgeOnly
}: HeaderBadgesProps) {
  if (showMentorBadgeOnly) {
    return (
      <Badge 
        variant="secondary" 
        className="flex items-center gap-1.5 bg-[#E5DEFF] hover:bg-[#D8D1F2] text-[#4B5563] transition-colors border border-[#D8D1F2] px-3 py-1 rounded-full shadow-sm"
      >
        <Users className="h-4 w-4" />
        <span className="font-medium">{profilesCount || 0} mentors</span>
      </Badge>
    );
  }

  if (showSalaryBadgeOnly && salaryRange) {
    return (
      <div className="flex items-center justify-between w-full">
        <Badge 
          variant="outline"
          className={badgeStyles.outline}
        >
          <DollarSign className="h-4 w-4" />
          {salaryRange}
        </Badge>
        {onBookmarkToggle && (
          <div className="w-[120px] flex justify-center">
            <Heart 
              className={`h-5 w-5 cursor-pointer hover:scale-110 transition-transform ${
                isBookmarked ? 'fill-current text-red-500' : 'text-gray-400'
              }`}
              onClick={onBookmarkToggle}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Badge 
        variant="secondary" 
        className="flex items-center gap-1.5 bg-[#E5DEFF] hover:bg-[#D8D1F2] text-[#4B5563] transition-colors border border-[#D8D1F2] px-3 py-1 rounded-full shadow-sm"
      >
        <Users className="h-4 w-4" />
        <span className="font-medium">{profilesCount || 0} mentors</span>
      </Badge>
      
      {salaryRange && (
        <Badge 
          variant="outline"
          className={badgeStyles.outline}
        >
          <DollarSign className="h-4 w-4" />
          {salaryRange}
        </Badge>
      )}
    </div>
  );
}