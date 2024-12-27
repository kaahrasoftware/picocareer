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
  switch (view) {
    case "day":
      return (
        <DayView
          date={selectedDate}
          events={events}
          availability={availability}
          isMentor={isMentor}
          onEventClick={onEventClick}
        />
      );
    case "week":
      return (
        <WeekView
          date={selectedDate}
          events={events}
          availability={availability}
          isMentor={isMentor}
          onEventClick={onEventClick}
        />
      );
    case "month":
      return (
        <MonthView
          date={selectedDate}
          onSelectDate={onSelectDate}
          hasAvailability={hasAvailability}
        />
      );
    default:
      return null;
  }
}