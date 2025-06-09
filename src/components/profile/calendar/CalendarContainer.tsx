import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter } from "date-fns";
import { Availability } from "@/types/calendar";
import type { CalendarEvent } from "@/types/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
interface CalendarContainerProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  availability: Availability[];
  events?: CalendarEvent[];
  selectedDateRange?: DateRange | undefined;
  setSelectedDateRange?: (range: DateRange | undefined) => void;
  selectionMode?: "single" | "range";
}
export function CalendarContainer({
  selectedDate,
  setSelectedDate,
  availability,
  events = [],
  selectedDateRange,
  setSelectedDateRange,
  selectionMode = "single"
}: CalendarContainerProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Function to determine if a date has sessions
  const hasSessionsOnDate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return events.some(event => format(new Date(event.start_time), 'yyyy-MM-dd') === dateStr);
  };

  // Function to determine availability status for a date
  const getAvailabilityStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get both one-time and recurring slots for this date
    const dayAvailabilities = availability.filter(slot => {
      // For one-time slots, check the specific date
      if (!slot.recurring && format(new Date(slot.start_date_time), 'yyyy-MM-dd') === dateStr) {
        return true;
      }

      // For recurring slots, check if they apply to this date
      if (slot.recurring && slot.day_of_week === dayOfWeek) {
        // Check if the slot was created before the date we're checking
        // This ensures recurring slots only apply to future dates from when they were created
        const slotCreationDate = new Date(slot.created_at || slot.start_date_time);
        slotCreationDate.setHours(0, 0, 0, 0);

        // Only apply recurring slots to dates that are after the creation date
        return isAfter(date, slotCreationDate) || format(date, 'yyyy-MM-dd') === format(slotCreationDate, 'yyyy-MM-dd');
      }
      return false;
    });

    // If there's at least one available slot, consider the day available
    const hasAvailable = dayAvailabilities.some(slot => slot.is_available);
    if (hasAvailable) return 'available';
    return null;
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
  };
  const handleCancelSession = async () => {
    handleCloseDialog();
  };
  return <div className="space-y-6">
      <div className={cn("mx-auto", selectionMode === "range" ? "w-full" : "w-fit")}>
        {selectionMode === "single" ? <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} defaultMonth={selectedDate} className="rounded-lg border bg-card shadow-sm p-3" modifiers={{
        sessions: hasSessionsOnDate,
        available: date => getAvailabilityStatus(date) === 'available'
      }} modifiersStyles={{
        sessions: {
          border: '2px solid #3b82f6',
          borderRadius: '6px'
        },
        available: {
          backgroundColor: 'rgba(34, 197, 94, 0.15)',
          color: '#166534',
          fontWeight: 500
        }
      }} /> : <div className="bg-card border rounded-lg shadow-sm p-4">
            <Calendar mode="range" selected={selectedDateRange} onSelect={setSelectedDateRange} defaultMonth={selectedDate} className="mx-auto" numberOfMonths={2} modifiers={{
          sessions: hasSessionsOnDate,
          available: date => getAvailabilityStatus(date) === 'available'
        }} modifiersStyles={{
          sessions: {
            border: '2px solid #3b82f6',
            borderRadius: '6px'
          },
          available: {
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#166534',
            fontWeight: 500
          }
        }} styles={{
          day_range_middle: {
            backgroundColor: 'rgba(147, 51, 234, 0.1)',
            color: '#7e22ce'
          },
          day_selected: {
            backgroundColor: '#9333ea',
            color: 'white',
            fontWeight: 'bold'
          },
          day_range_end: {
            backgroundColor: '#9333ea',
            color: 'white',
            fontWeight: 'bold'
          }
        }} disabled={date => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today;
        }} />
          </div>}
      </div>

      {selectedDate && selectedDateEvents.length > 0}
      
      {selectedDate && selectedDateEvents.length > 0 && <ScrollArea className="h-[300px] w-full sm:w-[350px] mx-auto sm:mx-0">
          
        </ScrollArea>}

      <SessionDetailsDialog session={selectedEvent} onClose={() => setSelectedEvent(null)} onCancel={handleCancelSession} />
    </div>;
}