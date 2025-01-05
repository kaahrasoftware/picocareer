import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarEvent } from "@/types/calendar";
import { SessionDetailsDialog } from "./calendar/SessionDetailsDialog";
import { CalendarHeader } from "./calendar/CalendarHeader";
import { CalendarContent } from "./calendar/CalendarContent";
import type { Profile } from "@/types/database/profiles";

interface CalendarTabProps {
  profile: Profile;
}

export function CalendarTab({ profile }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [cancellationNote, setCancellationNote] = useState("");
  const { toast } = useToast();

  // Get mentor availability
  const { data: availability = [], isLoading: isAvailabilityLoading } = useQuery({
    queryKey: ['mentor_availability', profile.id, selectedDate],
    queryFn: async () => {
      if (!profile.id || !selectedDate) return [];

      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('is_available', true)
        .or(`and(start_date_time.gte.${startOfDay.toISOString()},start_date_time.lte.${endOfDay.toISOString()}),and(recurring.eq.true,day_of_week.eq.${selectedDate.getDay()})`);

      if (error) throw error;
      return data;
    },
    enabled: !!profile.id && !!selectedDate && profile.user_type === 'mentor',
  });

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

  const isMentor = profile.user_type === 'mentor';

  if (isAvailabilityLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CalendarHeader profile={profile} />
      
      <CalendarContent
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        availability={availability}
        onEventClick={setSelectedSession}
        onEventDelete={handleEventDelete}
        isMentor={isMentor}
      />

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
