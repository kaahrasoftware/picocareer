
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Star } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface MentorRatingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  mentorId: string;
}

interface Rating {
  id: string;
  rating: number;
  notes: string | null;
  created_at: string;
  from_profile: {
    full_name: string;
  }
}

export function MentorRatingsDialog({ isOpen, onClose, mentorId }: MentorRatingDialogProps) {
  const { data: ratings, isLoading } = useQuery({
    queryKey: ['mentor-ratings', mentorId],
    queryFn: async () => {
      const { data } = await supabase
        .from('session_feedback')
        .select(`
          id,
          rating,
          notes,
          created_at,
          from_profile:from_profile_id (
            full_name
          )
        `)
        .eq('to_profile_id', mentorId)
        .eq('feedback_type', 'mentee_feedback')
        .order('created_at', { ascending: false });

      return (data as Rating[]) || [];
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mentor's Ratings & Feedback</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              Loading ratings...
            </div>
          ) : ratings && ratings.length > 0 ? (
            <div className="space-y-4">
              {ratings.map((rating) => (
                <div key={rating.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-yellow-400">
                        <Star className="h-5 w-5 fill-current" />
                        <span className="ml-1 font-medium">{rating.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        by {rating.from_profile.full_name}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(rating.created_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  {rating.notes && (
                    <p className="text-sm text-muted-foreground mt-2">
                      "{rating.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground p-4">
              No ratings found
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
