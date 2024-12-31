import { useState } from "react";
import { CalendarContainer } from "./CalendarContainer";
import { EventsSidebar } from "./EventsSidebar";
import { CalendarHeader } from "./CalendarHeader";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { CalendarEvent } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  events: CalendarEvent[];
  availability: any[];
  isMentor: boolean;
  onEventDelete: (event: CalendarEvent) => void;
}

export function CalendarView({ events, availability, isMentor, onEventDelete }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [cancellationNote, setCancellationNote] = useState("");
  const { toast } = useToast();

  const handleCancelSession = async () => {
    if (!selectedSession?.session_details?.id) return;

    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled',
          notes: cancellationNote 
        })
        .eq('id', selectedSession.session_details.id);

      if (error) throw error;

      // Call the parent's onEventDelete to update the UI
      onEventDelete(selectedSession);
      
      // Close the dialog and reset state
      setSelectedSession(null);
      setCancellationNote("");

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled successfully.",
      });
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive",
      });
    }
  };

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
              onEventDelete={onEventDelete}
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