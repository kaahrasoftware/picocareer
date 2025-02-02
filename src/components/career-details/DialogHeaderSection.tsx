import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HeaderBadges } from "./HeaderBadges";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DialogHeaderSectionProps {
  title: string;
  profilesCount: number;
  salaryRange?: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  onShare: () => void;
  careerId: string;
}

export function DialogHeaderSection({
  title,
  profilesCount,
  salaryRange,
  isBookmarked,
  onBookmarkToggle,
  onShare,
  careerId,
}: DialogHeaderSectionProps) {
  return (
    <DialogHeader className="p-4 pb-0">
      <div className="flex justify-between items-center">
        <DialogTitle className="text-xl md:text-2xl font-bold text-foreground">
          {title}
        </DialogTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onShare}
            className="h-9 w-9"
          >
            <Share2 className="h-5 w-5" />
          </Button>
          <HeaderBadges 
            profilesCount={profilesCount}
            salaryRange={salaryRange}
            isBookmarked={isBookmarked}
            onBookmarkToggle={onBookmarkToggle}
            showMentorBadgeOnly
          />
        </div>
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