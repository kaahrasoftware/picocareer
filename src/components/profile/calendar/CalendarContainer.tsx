import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";
import type { CalendarEvent } from "@/types/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SessionDetailsDialog } from "./SessionDetailsDialog";

interface CalendarContainerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availability: Availability[];
  events?: CalendarEvent[];
}

export function CalendarContainer({ 
  selectedDate, 
  setSelectedDate, 
  availability,
  events = [] 
}: CalendarContainerProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Function to determine if a date has sessions
  const hasSessionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => {
      const eventDate = new Date(event.start_time);
      return format(eventDate, 'yyyy-MM-dd') === dateStr;
    });
  };

  // Function to determine availability status for a date
  const getAvailabilityStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();

    // Get both one-time and recurring slots for this date
    const dayAvailabilities = availability.filter(slot => {
      if (slot.recurring && slot.day_of_week === dayOfWeek) {
        return true;
      }
      const slotDate = new Date(slot.start_time);
      return format(slotDate, 'yyyy-MM-dd') === dateStr;
    });

    const hasAvailable = dayAvailabilities.some(slot => slot.is_available);
    const hasUnavailable = dayAvailabilities.some(slot => !slot.is_available);

    if (hasAvailable && hasUnavailable) return 'mixed';
    if (hasAvailable) return 'available';
    if (hasUnavailable) return 'unavailable';
    return null;
  };

  // Filter events for selected date
  const selectedDateEvents = events.filter(event => {
    if (!selectedDate) return false;
    const eventDate = new Date(event.start_time);
    return format(eventDate, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
  };

  const handleCancelSession = async () => {
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <div className="w-full sm:w-fit mx-auto">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          defaultMonth={selectedDate}
          className="rounded-md border bg-kahra-darker mx-auto"
          modifiers={{
            sessions: hasSessionsOnDate,
            available: (date) => getAvailabilityStatus(date) === 'available',
            unavailable: (date) => getAvailabilityStatus(date) === 'unavailable',
            mixed: (date) => getAvailabilityStatus(date) === 'mixed'
          }}
          modifiersStyles={{
            sessions: {
              border: '2px solid #3b82f6',
              borderRadius: '4px'
            },
            available: {
              backgroundColor: 'rgba(34, 197, 94, 0.2)',
              color: '#166534'
            },
            unavailable: {
              backgroundColor: 'rgba(239, 68, 68, 0.2)',
              color: '#991b1b'
            },
            mixed: {
              backgroundColor: 'rgba(234, 179, 8, 0.2)',
              color: '#854d0e'
            }
          }}
        />
      </div>

      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-center sm:text-left">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <ScrollArea className="h-[300px] w-full sm:w-[350px] mx-auto sm:mx-0">
            <div className="space-y-3 px-2">
              {selectedDateEvents.map((event) => (
                <Card 
                  key={event.id}
                  className={`
                    ${event.status === 'cancelled' ? 'border-red-500/20 bg-red-500/10' : 
                      event.event_type === 'session' ? 'border-blue-500/20 bg-blue-500/10' : 
                      'border-gray-500/20 bg-gray-500/10'}
                    hover:shadow-md transition-all cursor-pointer
                  `}
                  onClick={() => handleEventClick(event)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-medium">{event.title}</h4>
                        {event.description && (
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(new Date(event.start_time), 'h:mm a')}
                      </span>
                    </div>
                    {event.status === 'cancelled' && (
                      <span className="text-sm text-red-500 mt-2 block">
                        Cancelled
                      </span>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      <SessionDetailsDialog
        session={selectedEvent}
        onClose={handleCloseDialog}
        onCancel={handleCancelSession}
      />
    </div>
  );
}