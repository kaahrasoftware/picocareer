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
    <DialogHeader className="p-4 pb-0">
      <div className="flex justify-between items-center">
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