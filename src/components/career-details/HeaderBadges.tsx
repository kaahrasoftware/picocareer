import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, DollarSign, Bookmark } from "lucide-react";

interface HeaderBadgesProps {
  profilesCount: number;
  salaryRange?: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  showMentorBadgeOnly?: boolean;
  showSalaryBadgeOnly?: boolean;
}

export function HeaderBadges({
  profilesCount,
  salaryRange,
  isBookmarked,
  onBookmarkToggle,
  showMentorBadgeOnly,
  showSalaryBadgeOnly,
}: HeaderBadgesProps) {
  if (showMentorBadgeOnly) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs md:text-sm">
          <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
          {profilesCount} Mentors
        </Badge>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 md:h-9 md:w-9"
          onClick={onBookmarkToggle}
        >
          <Bookmark
            className={`h-4 w-4 md:h-5 md:w-5 ${isBookmarked ? "fill-current" : ""}`}
          />
        </Button>
      </div>
    );
  }

  if (showSalaryBadgeOnly && salaryRange) {
    return (
      <Badge variant="secondary" className="text-xs md:text-sm">
        <DollarSign className="h-3 w-3 md:h-4 md:w-4 mr-1" />
        {salaryRange}
      </Badge>
    );
  }

  return null;
}