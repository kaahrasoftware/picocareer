import React from 'react';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { CalendarEvent, Availability } from '@/types/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TimeGrid } from './TimeGrid';
import { EventBlock } from './EventBlock';
import { AvailabilityBlock } from './AvailabilityBlock';

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
  console.log("Events in sidebar:", events);
  console.log("Using timezone:", timezone);

  return (
    <div className="w-[800px] bg-background border border-border rounded-lg p-4">
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
            <TimeGrid timezone={timezone} />
            
            {/* Events */}
            {events.map((event) => (
              <EventBlock
                key={event.id}
                event={event}
                timezone={timezone}
                onEventClick={onEventClick}
              />
            ))}

            {/* Availability slots */}
            {isMentor && availability.map((slot, index) => (
              <AvailabilityBlock
                key={`${slot.date_available}-${slot.start_time}-${index}`}
                slot={slot}
                index={index}
                date={date}
                timezone={timezone}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}