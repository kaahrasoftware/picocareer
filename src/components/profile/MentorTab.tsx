import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorshipStats } from "./mentor/MentorshipStats";
import { MentorDetails } from "./mentor/MentorDetails";
import { SessionTypeManager } from "./mentor/SessionTypeManager";
import { AvailabilityManager } from "./mentor/AvailabilityManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface MentorTabProps {
  profileId: string;
}

export function MentorTab({ profileId }: MentorTabProps) {
  const { toast } = useToast();

  // Fetch mentor sessions
  const { data: sessionsResponse } = useQuery({
    queryKey: ["mentor-sessions", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_sessions")
        .select(`
          id,
          scheduled_at,
          status,
          session_type_id,
          mentee_id
        `)
        .eq("mentor_id", profileId);

      if (error) throw error;
      return data;
    },
  });

  // Fetch session types
  const { data: sessionTypesResponse } = useQuery({
    queryKey: ["session-types", profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mentor_session_types")
        .select("*")
        .eq("profile_id", profileId);

      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const stats = (() => {
    if (sessionsResponse && sessionTypesResponse) {
      const sessions = sessionsResponse;
      const now = new Date();
      const completed_sessions = sessions.filter(s => new Date(s.scheduled_at) < now).length;
      const upcoming_sessions = sessions.filter(s => new Date(s.scheduled_at) >= now).length;
      const cancelled_sessions = sessions.filter(s => s.status === 'cancelled').length;
      
      // Calculate unique mentees
      const unique_mentees = new Set(sessions.map(s => s.mentee_id)).size;
      
      const total_hours = sessions.reduce((acc, session) => {
        const sessionType = sessionTypesResponse.data.find(st => st.id === session.session_type_id);
        return acc + (sessionType?.duration || 60) / 60;
      }, 0);

      // Calculate session data for the chart
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          name: date.toLocaleString('default', { month: 'short' }),
          date: date,
          sessions: 0
        };
      }).reverse();

      const session_data = last6Months.map(month => {
        const count = sessions.filter(session => {
          const sessionDate = new Date(session.scheduled_at);
          return sessionDate.getMonth() === month.date.getMonth() &&
                 sessionDate.getFullYear() === month.date.getFullYear();
        }).length;
        return {
          name: month.name,
          sessions: count
        };
      });

      const total_sessions = sessions.length;

      return {
        total_sessions,
        completed_sessions,
        upcoming_sessions,
        cancelled_sessions,
        unique_mentees,
        total_hours,
        session_data
      }
    }
    return null;
  })();

  // Check timezone setting
  useEffect(() => {
    const checkTimezone = async () => {
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', profileId)
        .eq('setting_type', 'timezone')
        .maybeSingle();

      if (error) {
        console.error('Error checking timezone:', error);
      } else if (!data?.setting_value) {
        toast({
          title: "Timezone not set",
          description: "Please set your timezone in settings to ensure accurate scheduling.",
          variant: "destructive",
        });
      }
    };

    checkTimezone();
  }, [profileId, toast]);

  return (
    <Tabs defaultValue="stats" className="w-full">
      <TabsList>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="session-types">Session Types</TabsTrigger>
        <TabsTrigger value="availability">Availability</TabsTrigger>
      </TabsList>

      <TabsContent value="stats">
        {stats && <MentorshipStats stats={stats} />}
      </TabsContent>

      <TabsContent value="details">
        <MentorDetails profileId={profileId} />
      </TabsContent>

      <TabsContent value="session-types">
        <SessionTypeManager profileId={profileId} />
      </TabsContent>

      <TabsContent value="availability">
        <AvailabilityManager profileId={profileId} />
      </TabsContent>
    </Tabs>
  );
}