import React from "react";
import { CalendarViewType } from "./types";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";

interface CalendarViewsProps {
  selectedDate: Date;
  onSelectDate: (date: Date | undefined) => void;
  events: any[];
  availability?: any[];
  isMentor?: boolean;
  onEventClick?: (event: any) => void;
  hasAvailability: (date: Date) => boolean;
  view: CalendarViewType;
}

export function CalendarViews({
  selectedDate,
  onSelectDate,
  events,
  availability = [],
  isMentor = false,
  onEventClick,
  hasAvailability,
  view
}: CalendarViewsProps) {
  return (
    <div className="h-[calc(100vh-12rem)] bg-background rounded-lg border">
      {view === "day" && (
        <DayView
          date={selectedDate}
          events={events}
          availability={availability}
          isMentor={isMentor}
          onEventClick={onEventClick}
        />
      )}
      {view === "week" && (
        <WeekView
          date={selectedDate}
          events={events}
          availability={availability}
          isMentor={isMentor}
          onEventClick={onEventClick}
        />
      )}
      {view === "month" && (
        <MonthView
          date={selectedDate}
          onSelectDate={onSelectDate}
          hasAvailability={hasAvailability}
        />
      )}
    </div>
  );
}