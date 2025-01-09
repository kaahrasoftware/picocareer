import { useState } from "react";
import { MeetingPlatform } from "@/types/session";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export function useBookSession() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const bookSession = async (
    mentorId: string,
    sessionTypeId: string,
    scheduledAt: string,
    meetingPlatform: MeetingPlatform,
    notes?: string
  ) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("mentor_sessions").insert({
        mentor_id: mentorId,
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