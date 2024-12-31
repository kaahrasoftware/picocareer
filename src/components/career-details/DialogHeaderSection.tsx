import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bookmark } from "lucide-react";
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
      <div className="relative">
        <DialogTitle className="text-2xl font-bold text-foreground pr-12">
          {title}
        </DialogTitle>
        <Bookmark 
          className={`h-6 w-6 absolute right-0 top-2 cursor-pointer hover:scale-110 transition-transform ${
            isBookmarked ? 'fill-current text-primary' : 'text-gray-400'
          }`}
          onClick={onBookmarkToggle}
        />
      </div>
      <HeaderBadges 
        profilesCount={profilesCount}
        salaryRange={salaryRange}
      />
    </DialogHeader>
  );
}