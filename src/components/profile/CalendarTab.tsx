import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { CalendarEvent } from "@/types/calendar";
import { CalendarView } from "./calendar/CalendarView";
import { AvailabilitySection } from "./calendar/AvailabilitySection";

export function CalendarTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get initial session and listen for auth changes
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: ['auth-session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No authenticated session');
      return session;
    },
    retry: false
  });

  // Then, get the user's profile type only if we have a session
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  // Get calendar events using our custom hook
  const { data: events = [], isLoading: isEventsLoading } = useSessionEvents();

  const handleEventDelete = (deletedEvent: CalendarEvent) => {
    // Update the events list by filtering out the deleted event
    queryClient.setQueryData(['session-events'], (oldEvents: CalendarEvent[] = []) => {
      return oldEvents.filter(event => event.id !== deletedEvent.id);
    });
  };

  const isMentor = profile?.user_type === 'mentor';
  const isLoading = isSessionLoading || isProfileLoading || isEventsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Please sign in to view your calendar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarView
        events={events}
        availability={[]} // This will be populated by the AvailabilityManager
        isMentor={isMentor}
        onEventDelete={handleEventDelete}
      />
      
      {isMentor && <AvailabilitySection profileId={session.user.id} />}
    </div>
  );
}