import React from "react";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { CalendarEvent } from "@/types/calendar";
import { EventsSidebar } from "./EventsSidebar";
import { CalendarContainer } from "./CalendarContainer";

interface CalendarContentProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availability: any[];
  onEventClick: (event: CalendarEvent | null) => void;
  onEventDelete: (event: CalendarEvent) => void;
  isMentor: boolean;
}

export function CalendarContent({
  selectedDate,
  setSelectedDate,
  availability,
  onEventClick,
  onEventDelete,
  isMentor
}: CalendarContentProps) {
  const { data: events = [], isLoading: isEventsLoading } = useSessionEvents();

  if (isEventsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
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
            onEventClick={onEventClick}
            onEventDelete={onEventDelete}
          />
        </div>
      )}
    </div>
  );
}