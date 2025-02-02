import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HeaderBadges } from "./HeaderBadges";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DialogHeaderSectionProps {
  title: string;
  profilesCount: number;
  salaryRange?: string;
  isBookmarked: boolean;
  onBookmarkToggle: () => void;
  careerId: string;
}

export function DialogHeaderSection({
  title,
  profilesCount,
  salaryRange,
  isBookmarked,
  onBookmarkToggle,
  careerId,
}: DialogHeaderSectionProps) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/career?dialog=true&careerId=${careerId}`;
    const shareText = `Check out this career: ${title}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Share Career',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const shareUrl = `${window.location.origin}/career?dialog=true&careerId=${careerId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

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
            onClick={handleShare}
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