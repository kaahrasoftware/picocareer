import { useState, useEffect, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { CalendarEvent } from "@/types/calendar";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

export function CalendarView({ events, onEventClick, onDateSelect, selectedDate }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { getSetting } = useUserSettings();
  const { toast } = useToast();
  const userTimezone = getSetting("timezone");

  const handleEventClick = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    if (onEventClick) {
      onEventClick(event);
    }
  }, [onEventClick]);

  const handleDateSelect = useCallback((date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  }, [onDateSelect]);

  const onCancel = async () => {
    if (!selectedEvent?.session_details?.id) return;

    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ status: 'cancelled' })
        .eq('id', selectedEvent.session_details.id);

      if (error) throw error;

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled successfully",
      });

      setSelectedEvent(null);
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel session",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!userTimezone) {
      toast({
        title: "Timezone not set",
        description: "Please set your timezone in settings to ensure accurate scheduling.",
        variant: "destructive",
      });
    }
  }, [userTimezone, toast]);

  return (
    <div className="space-y-4">
      <Calendar
        events={events}
        onEventClick={handleEventClick}
        onDateSelect={handleDateSelect}
        selectedDate={selectedDate}
      />

      {selectedEvent && (
        <SessionDetailsDialog
          session={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onCancel={onCancel}
        />
      )}
    </div>
  );
}