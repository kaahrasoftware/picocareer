import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "@/integrations/supabase/types/user.types";
import { MentorHeader } from "./mentor/MentorHeader";
import { MentorInfo } from "./mentor/MentorInfo";
import { MentorStats } from "./mentor/MentorStats";
import { MentorSkills } from "./mentor/MentorSkills";
import { MentorBio } from "./mentor/MentorBio";
import { MentorActions } from "./mentor/MentorActions";
import { Separator } from "@/components/ui/separator";

interface MentorDetailsDialogProps {
  mentor: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MentorDetailsDialog({ mentor, open, onOpenChange }: MentorDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <div className="space-y-6">
          <MentorHeader
            image_url={mentor.image_url}
            name={mentor.full_name}
            username={mentor.username}
          />

          <MentorInfo
            company={mentor.company}
            title={mentor.title}
            education={mentor.education}
            position={mentor.position}
          />

          <Separator />

          <MentorStats stats={mentor.stats} sessions_held={mentor.sessions_held} />

          <Separator />

          {mentor.skills && mentor.tools && (
            <>
              <MentorSkills skills={mentor.skills} tools={mentor.tools} />
              <Separator />
            </>
          )}

          {mentor.bio && (
            <>
              <MentorBio bio={mentor.bio} />
              <Separator />
            </>
          )}

          <MentorActions mentor={mentor} />
        </div>
      </DialogContent>
    </Dialog>
  );
}