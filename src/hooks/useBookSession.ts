import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface BookSessionParams {
  mentorId: string;
  date: Date;
  selectedTime: string;
  sessionTypeId: string;
  note: string;
}

export function useBookSession() {
  const { toast } = useToast();

  const bookSession = async ({ mentorId, date, selectedTime, sessionTypeId, note }: BookSessionParams) => {
    if (!date || !selectedTime || !sessionTypeId || !mentorId) return false;

    const scheduledAt = new Date(date);
    const [hours, minutes] = selectedTime.split(':');
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const { error } = await supabase
      .from('mentor_sessions')
      .insert({
        mentor_id: mentorId,
        mentee_id: (await supabase.auth.getUser()).data.user?.id,
        session_type_id: sessionTypeId,
        scheduled_at: scheduledAt.toISOString(),
        notes: note,
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Success",
      description: "Session booked successfully",
    });
    return true;
  };

  return bookSession;
}