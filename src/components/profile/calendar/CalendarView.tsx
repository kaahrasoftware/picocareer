import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { AvailabilitySection } from "./AvailabilitySection";
import { EventsSidebar } from "./EventsSidebar";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useToast } from "@/hooks/use-toast";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarViewProps {
  isMentor: boolean;
}

export function CalendarView({ isMentor }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const { toast } = useToast();
  const { data: events = [], refetch: refetchEvents } = useSessionEvents();

  const handleEventDelete = (deletedEvent: CalendarEvent) => {
    refetchEvents();
  };

  return (
    <div className="flex gap-4">
      <div className="w-fit">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        {isMentor && selectedDate && (
          <AvailabilitySection 
            selectedDate={selectedDate}
            onAvailabilityChange={refetchEvents}
          />
        )}
      </div>

      {selectedDate && (
        <div className="w-fit">
          <EventsSidebar
            date={selectedDate}
            events={events}
            isMentor={isMentor}
            onEventClick={setSelectedSession}
            onEventDelete={handleEventDelete}
          />
        </div>
      )}

      <SessionDetailsDialog
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
      />
    </div>
  );
}