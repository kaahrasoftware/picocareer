import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HeaderBadges } from "./HeaderBadges";

interface DialogHeaderSectionProps {
  title: string;
  profilesCount: number;
  salaryRange?: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
}

export function DialogHeaderSection({
  title,
  profilesCount,
  salaryRange,
  isBookmarked,
  onBookmarkToggle,
}: DialogHeaderSectionProps) {
  return (
    <DialogHeader className="p-3 pb-0 md:p-4 md:pb-0">
      <div className="flex flex-col space-y-2 md:space-y-0 md:flex-row md:justify-between md:items-center">
        <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
          {title}
        </DialogTitle>
        <HeaderBadges 
          profilesCount={profilesCount}
          salaryRange={salaryRange}
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
          showMentorBadgeOnly
        />
      </div>
      <div className="mt-2">
        <HeaderBadges 
          profilesCount={profilesCount}
          salaryRange={salaryRange}
          isBookmarked={isBookmarked}
          onBookmarkToggle={onBookmarkToggle}
          showSalaryBadgeOnly
        />
      </div>
    </DialogHeader>
  );
}