
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Profile } from "@/types/database/profiles";

interface MentorMenteesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
}

export function MentorMenteesDialog({ isOpen, onClose, mentorId }: MentorMenteesDialogProps) {
  const { data: mentees, isLoading } = useQuery({
    queryKey: ['mentor-mentees', mentorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('mentor_sessions')
        .select(`
          mentee:mentee_id (
            id,
            full_name,
            avatar_url,
            email
          )
        `)
        .eq('mentor_id', mentorId)
        .order('created_at', { ascending: false });

      // Get unique mentees
      const uniqueMentees = data?.reduce((acc: Profile[], curr) => {
        if (curr.mentee && !acc.find(m => m.id === curr.mentee.id)) {
          acc.push(curr.mentee as Profile);
        }
        return acc;
      }, []);

      return uniqueMentees || [];
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mentor's Mentees</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              Loading mentees...
            </div>
          ) : mentees && mentees.length > 0 ? (
            <div className="space-y-4">
              {mentees.map((mentee) => (
                <div key={mentee.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted">
                  <Avatar className="h-10 w-10">
                    <img 
                      src={mentee.avatar_url || "https://via.placeholder.com/40"} 
                      alt={mentee.full_name || ""}
                    />
                  </Avatar>
                  <div>
                    <div className="font-medium">{mentee.full_name}</div>
                    <div className="text-sm text-muted-foreground">{mentee.email}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No mentees found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
