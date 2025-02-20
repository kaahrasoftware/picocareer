
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SessionType } from "@/types/session";

interface SessionResponse {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: string;
  scheduled_at: string;
  session_type: {
    duration: number;
  };
}

interface FeedbackResponse {
  id: string;
  session_id: string;
  did_not_show_up: boolean;
  rating: number;
  to_profile_id: string;
  from_profile_id: string;
}

export function useSessionQueries(profileId: string | undefined) {
  const { data: sessionsResponse, refetch: refetchSessions } = useQuery({
    queryKey: ["mentor-sessions", profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      console.log('Fetching sessions for mentor:', profileId);
      
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select("*, session_type:mentor_session_types(duration)")
        .eq("mentor_id", profileId);

      if (error) {
        console.error('Error fetching sessions:', error);
        throw error;
      }

      console.log('Fetched sessions:', data);
      return data as SessionResponse[];
    },
    enabled: !!profileId
  });

  const { data: sessionTypes, refetch: refetchSessionTypes } = useQuery({
    queryKey: ["session-types", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("mentor_session_types")
        .select("*")
        .eq("profile_id", profileId);

      if (error) throw error;
      return data as SessionType[];
    },
    enabled: !!profileId
  });

  const { data: feedbackResponse } = useQuery({
    queryKey: ["mentor-feedback", profileId],
    queryFn: async () => {
      if (!profileId) return null;

      const { data, error } = await supabase
        .from("session_feedback")
        .select("*")
        .eq("to_profile_id", profileId)
        .eq("feedback_type", "mentee_feedback");

      if (error) {
        console.error('Error fetching feedback:', error);
        throw error;
      }

      return data as FeedbackResponse[];
    },
    enabled: !!profileId
  });

  return {
    sessionsResponse,
    sessionTypes,
    feedbackResponse,
    refetchSessions,
    refetchSessionTypes
  };
}
