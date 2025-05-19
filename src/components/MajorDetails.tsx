
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Major } from "@/types/database/majors";
import { MajorDialogHeader } from "./major-details/MajorDialogHeader";
import { MajorDetailsContent } from "./major-details/MajorDetailsContent";
import { MajorDetailsErrorState } from "./major-details/MajorDetailsErrorState";
import { useMajorDetails } from "@/hooks/useMajorDetails";
import { useMajorSharing } from "@/hooks/useMajorSharing";

interface MajorDetailsProps {
  major: Major;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MajorDetails({ major, open, onOpenChange }: MajorDetailsProps) {
  const { majorWithCareers, isError, isBookmarked, handleBookmarkToggle } = useMajorDetails(major, open);
  const { handleShare } = useMajorSharing();

  if (!major) return null;

  // Show error state
  if (isError) {
    return <MajorDetailsErrorState open={open} onOpenChange={onOpenChange} />;
  }

  const onShare = () => handleShare(major.id, major.title, major.description);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
        <MajorDialogHeader 
          major={major}
          isBookmarked={isBookmarked}
          onBookmarkToggle={handleBookmarkToggle}
          onShare={onShare}
        />
        
        <MajorDetailsContent major={major} majorWithCareers={majorWithCareers} />
      </DialogContent>
    </Dialog>
  );
}
