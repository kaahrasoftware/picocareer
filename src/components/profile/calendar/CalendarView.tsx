import { useState } from "react";
import { CalendarContainer } from "./CalendarContainer";
import { EventsSidebar } from "./EventsSidebar";
import { CalendarHeader } from "./CalendarHeader";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { CalendarEvent } from "@/types/calendar";

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