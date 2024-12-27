import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarEvent, Availability } from "@/types/calendar";
import { TimeGrid } from "./TimeGrid";
import { TimeGridLines } from "./TimeGridLines";
import { EventSlot } from "./EventSlot";
import { AvailabilitySlot } from "./AvailabilitySlot";

interface EventsSidebarProps {
  date: Date;
  events: CalendarEvent[];
  availability?: Availability[];
  isMentor?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  timezone?: string;
}

export function EventsSidebar({ 
  date, 
  events, 
  availability = [], 
  isMentor = false, 
  onEventClick,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone 
}: EventsSidebarProps) {
  const CELL_HEIGHT = 26; // Height for 30-minute intervals

  // Filter out cancelled events for both calendar grid and sidebar
  const activeEvents = events.filter(event => event.status !== 'cancelled');

  return (
    <div className="w-[600px] bg-background border border-border rounded-lg p-4">
      <div className="space-y-4">
        <div>
          <h3 className="font-medium text-lg">
            {formatInTimeZone(date, timezone, 'MMMM d, yyyy')}
          </h3>
          <p className="text-sm text-muted-foreground">
            Timezone: {timezone}
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="relative grid grid-cols-[80px_1fr] gap-4">
            <TimeGrid timezone={timezone} cellHeight={CELL_HEIGHT} />

            <div className="relative border-l border-border min-h-[1248px]">
              <TimeGridLines cellHeight={CELL_HEIGHT} />

              {activeEvents.map((event) => (
                <EventSlot
                  key={event.id}
                  event={event}
                  timezone={timezone}
                  onEventClick={onEventClick}
                  cellHeight={CELL_HEIGHT}
                />
              ))}

              {isMentor && availability.map((slot, index) => (
                <AvailabilitySlot
                  key={`${slot.date_available}-${slot.start_time}-${index}`}
                  slot={slot}
                  date={date}
                  timezone={timezone}
                  index={index}
                  cellHeight={CELL_HEIGHT}
                />
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}