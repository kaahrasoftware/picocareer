import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { CalendarEvent } from "@/types/calendar";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { SessionDetailsDialog } from "./calendar/SessionDetailsDialog";
import { EventsSidebar } from "./calendar/EventsSidebar";
import { CalendarContainer } from "./calendar/CalendarContainer";

export function CalendarTab() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [cancellationNote, setCancellationNote] = useState("");
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

  // Get mentor availability
  const { data: availability = [], isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['mentor_availability', session?.user?.id, selectedDate],
    queryFn: async () => {
      if (!session?.user?.id || !selectedDate) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('is_available', true)
        .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`);

      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id && !!selectedDate && profile?.user_type === 'mentor',
  });

  // Get calendar events using our custom hook
  const { data: events = [], isLoading: isEventsLoading } = useSessionEvents();

  const handleEventDelete = (deletedEvent: CalendarEvent) => {
    // Update the events list by filtering out the deleted event
    queryClient.setQueryData(['session-events'], (oldEvents: CalendarEvent[] = []) => {
      return oldEvents.filter(event => event.id !== deletedEvent.id);
    });
  };

  const handleCancelSession = async () => {
    if (!selectedSession?.session_details) return;

    try {
      // Update the session status in the database
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', selectedSession.session_details.id);

      if (error) throw error;

      // Create notifications for both mentor and mentee
      const notifications = [
        {
          profile_id: selectedSession.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentee.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        },
        {
          profile_id: selectedSession.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentor.full_name} has been cancelled. Note: ${cancellationNote}`,
          type: 'session_cancelled' as const
        }
      ];

      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Send cancellation emails
      const { error: emailError } = await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: selectedSession.session_details.id,
          type: 'cancellation'
        }
      });

      if (emailError) {
        console.error('Error sending cancellation emails:', emailError);
      }

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });

      // Close the dialog and reset state
      setSelectedSession(null);
      setCancellationNote("");
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['session-events'] });

    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const isMentor = profile?.user_type === 'mentor';
  const isLoading = isSessionLoading || isProfileLoading || isEventsLoading || isAvailabilityLoading;

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
      <CalendarHeader isMentor={isMentor} />

      <div className="flex gap-4">
        <div className="w-fit">
          <CalendarContainer
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={availability}
          />
        </div>

        {selectedDate && (
          <div className="w-fit">
            <EventsSidebar
              date={selectedDate}
              events={events}
              availability={availability}
              isMentor={isMentor}
              onEventClick={setSelectedSession}
              onEventDelete={handleEventDelete}
            />
          </div>
        )}
      </div>

      <SessionDetailsDialog
        session={selectedSession}
        onClose={() => {
          setSelectedSession(null);
          setCancellationNote("");
        }}
        onCancel={handleCancelSession}
        cancellationNote={cancellationNote}
        onCancellationNoteChange={setCancellationNote}
      />
    </div>
  );
}