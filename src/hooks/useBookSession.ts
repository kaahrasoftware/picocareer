import { useState } from "react";
import { MeetingPlatform, SessionType } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";
import { useAuthSession } from "./useAuthSession";

export function useBookSession() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();

  const bookSession = async (
    mentorId: string,
    sessionTypeId: string,
    scheduledAt: string,
    meetingPlatform: MeetingPlatform,
    notes?: string
  ) => {
    if (!session?.user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to book a session",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("mentor_sessions").insert({
        mentor_id: mentorId,
        mentee_id: session.user.id,
        session_type_id: sessionTypeId,
        scheduled_at: scheduledAt,
        meeting_platform: meetingPlatform,
        notes,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session booked successfully",
      });

      return true;
    } catch (error) {
      console.error("Error booking session:", error);
      toast({
        title: "Error",
        description: "Failed to book session",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { bookSession, isLoading };
}