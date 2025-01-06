import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CalendarView } from "./CalendarView";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { CalendarEvent } from "@/types/calendar";

export function CalendarContainer() {
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleShowSessionDetails = (session: CalendarEvent) => {
    setSelectedSession(session);
  };

  const handleCloseSessionDetails = () => {
    setSelectedSession(null);
  };

  const handleCancelSession = async () => {
    if (!selectedSession?.session_details?.id) return;

    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ status: 'cancelled' })
        .eq('id', selectedSession.session_details.id);

      if (error) throw error;

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled successfully",
      });

      // Refetch sessions or update state as needed
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <CalendarView
        events={events}
        onEventClick={handleShowSessionDetails}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />
      {selectedSession && (
        <SessionDetailsDialog
          session={selectedSession}
          onClose={handleCloseSessionDetails}
          onCancel={handleCancelSession}
        />
      )}
    </div>
  );
}
