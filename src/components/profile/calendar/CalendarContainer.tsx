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
  const [cancellationNote, setCancellationNote] = useState('');

  // Function to determine if a date has sessions
  const hasSessionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => format(new Date(event.start_time), 'yyyy-MM-dd') === dateStr);
  };

  // Filter events for selected date
  const selectedDateEvents = events.filter(event => {
    if (!selectedDate) return false;
    return format(new Date(event.start_time), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
  });

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };

  const handleCloseDialog = () => {
    setSelectedEvent(null);
    setCancellationNote('');
  };

  const handleCancelSession = async () => {
    // This would be implemented based on your session cancellation logic
    // For now, just close the dialog
    handleCloseDialog();
  };

  return (
    <div className="space-y-6">
      <div className="w-fit">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          defaultMonth={selectedDate}
          className="rounded-md border bg-kahra-darker"
          modifiers={{
            sessions: hasSessionsOnDate
          }}
          modifiersStyles={{
            sessions: {
              border: '2px solid #3b82f6',
              borderRadius: '4px'
            }
          }}
        />
      </div>

      {selectedDate && selectedDateEvents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">
            Events for {format(selectedDate, 'MMMM d, yyyy')}
          </h3>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-3">
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
                      <span className="text-sm text-muted-foreground">
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
        cancellationNote={cancellationNote}
        onCancellationNoteChange={setCancellationNote}
      />
    </div>
  );
}