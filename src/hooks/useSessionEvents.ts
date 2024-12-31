import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import type { CalendarEvent } from "@/types/calendar";

export function useSessionEvents() {
  const { session } = useAuthSession();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["session-events"],
    queryFn: async () => {
      if (!session?.user) {
        throw new Error("No user session found");
      }

      // First check if user has timezone set
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', session.user.id)
        .eq('setting_type', 'timezone')
        .single();

      if (!userSettings?.setting_value) {
        toast({
          title: "Timezone not set",
          description: "Please set your timezone in settings to ensure accurate scheduling.",
          variant: "destructive",
        });
      }

      // Fetch mentor sessions
      const { data: sessions, error } = await supabase
        .from("mentor_sessions")
        .select(`
          id,
          scheduled_at,
          status,
          meeting_link,
          mentor:mentor_id(
            id,
            full_name,
            avatar_url
          ),
          mentee:mentee_id(
            id,
            full_name,
            avatar_url
          ),
          session_type:session_type_id(
            type,
            duration
          )
        `)
        .or(`mentor_id.eq.${session.user.id},mentee_id.eq.${session.user.id}`);

      if (error) {
        throw error;
      }

      // Transform sessions into calendar events
      const events: CalendarEvent[] = sessions.map((session) => ({
        id: session.id,
        title: `Session with ${
          session.mentor.id === session.user.id
            ? session.mentee.full_name
            : session.mentor.full_name
        }`,
        start: new Date(session.scheduled_at),
        end: new Date(
          new Date(session.scheduled_at).getTime() +
            (session.session_type?.duration || 60) * 60 * 1000
        ),
        session_details: {
          status: session.status,
          meeting_link: session.meeting_link,
          mentor: session.mentor,
          mentee: session.mentee,
          session_type: session.session_type,
        },
      }));

      return events;
    },
    enabled: !!session?.user,
  });
}