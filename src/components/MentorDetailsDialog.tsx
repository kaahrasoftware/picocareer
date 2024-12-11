import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User, parseUserStats } from "@/types/user";
import { MentorHeader } from "./mentor/MentorHeader";
import { MentorInfo } from "./mentor/MentorInfo";
import { MentorBio } from "./mentor/MentorBio";
import { MentorStats } from "./mentor/MentorStats";
import { MentorSkills } from "./mentor/MentorSkills";
import { MentorActions } from "./mentor/MentorActions";

interface MentorDetailsDialogProps {
  mentor: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MentorDetailsDialog = ({
  mentor,
  open,
  onOpenChange,
}: MentorDetailsDialogProps) => {
  const stats = parseUserStats(mentor.stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <MentorHeader mentor={mentor} />
          <MentorInfo mentor={mentor} />
          <MentorBio mentor={mentor} />
          <MentorStats stats={stats} />
          <MentorSkills mentor={mentor} />
          <MentorActions mentor={mentor} />
        </div>
      </DialogContent>
    </Dialog>
  );
};