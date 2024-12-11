import { Dialog, DialogContent } from "@/components/ui/dialog";
import { User } from "@/types/user";
import { parseStats } from "@/types/stats";
import { MentorHeader } from "./mentor/MentorHeader";
import { MentorInfo } from "./mentor/MentorInfo";
import { MentorBio } from "./mentor/MentorBio";
import { MentorStats } from "./mentor/MentorStats";
import { MentorSkills } from "./mentor/MentorSkills";
import { MentorActions } from "./mentor/MentorActions";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MentorDetailsDialogProps {
  mentorId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MentorDetailsDialog = ({
  mentorId,
  open,
  onOpenChange,
}: MentorDetailsDialogProps) => {
  const { data: mentor, isLoading } = useQuery({
    queryKey: ['mentor', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', mentorId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Handle case where no user was found
          return null;
        }
        throw error;
      }

      return data as User;
    },
  });

  if (!mentor) {
    return null;
  }

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