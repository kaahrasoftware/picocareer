import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MeetingPlatform } from "@/types/session";

export function useSessionTypes(profileId: string) {
  return useQuery({
    queryKey: ["session-types", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_session_types")
        .select("*")
        .eq("profile_id", profileId);

      if (error) throw error;
      return data;
    },
    enabled: !!profileId,
  });
}