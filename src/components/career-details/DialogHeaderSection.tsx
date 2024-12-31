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
      <DialogTitle className="text-2xl font-bold text-foreground">
        {title}
      </DialogTitle>
      <HeaderBadges 
        profilesCount={profilesCount}
        salaryRange={salaryRange}
        isBookmarked={isBookmarked}
        onBookmarkToggle={onBookmarkToggle}
      />
    </DialogHeader>
  );
}