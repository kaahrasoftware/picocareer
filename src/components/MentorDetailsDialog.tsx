import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "@/types/user";
import { parseStats } from "@/types/stats";
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
  const stats = parseStats(mentor.stats);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          <MentorHeader name={mentor.name} username={mentor.username} imageUrl={mentor.image_url} />
          <MentorInfo title={mentor.title} company={mentor.company} position={mentor.position} education={mentor.education} />
          <MentorBio bio={mentor.bio} />
          <MentorStats stats={stats} sessions_held={mentor.sessions_held} />
          <MentorSkills skills={mentor.skills || []} tools={mentor.tools || []} keywords={mentor.keywords || []} />
          <MentorActions id={mentor.id} />
        </div>
      </DialogContent>
    </Dialog>
  );
};