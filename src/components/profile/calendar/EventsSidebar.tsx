
import { useState } from "react";
import { EmptyStateDisplay } from "./EmptyStateDisplay";
import { SessionCard } from "./SessionCard";
import type { CalendarEvent } from "@/types/calendar";

export interface EventsSidebarProps {
  date?: Date;
  events: CalendarEvent[];
  isMentor?: boolean;
  onEventDelete?: () => void;
}

export function EventsSidebar({ 
  date, 
  events = [], 
  isMentor = false,
  onEventDelete
}: EventsSidebarProps) {
  // Filter events for the selected date if a date is provided
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  
  const filteredEvents = date 
    ? events.filter(event => {
        // Ensure event.start_time is valid
        if (!event.start_time) return false;
        
        const eventDate = new Date(event.start_time);
        const selectedDate = new Date(date);
        
        // Compare only the date portion (not time)
        return eventDate.getDate() === selectedDate.getDate() && 
               eventDate.getMonth() === selectedDate.getMonth() && 
               eventDate.getFullYear() === selectedDate.getFullYear();
      })
    : events;
    
  const hasEvents = filteredEvents.length > 0;

  const statusFilters: Record<string, string> = {
    all: "All",
    scheduled: "Upcoming",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  
  // Apply status filter if not "all"
  const statusFilteredEvents = selectedFilter === "all" 
    ? filteredEvents 
    : filteredEvents.filter(event => event.status === selectedFilter);

  return (
    <div className="h-full overflow-hidden flex flex-col">
      {hasEvents && (
        <div className="px-4 py-2 border-b">
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {Object.entries(statusFilters).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-3 py-1 text-xs rounded-full whitespace-nowrap ${
                  selectedFilter === key 
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4">
        {statusFilteredEvents.length > 0 ? (
          <div className="space-y-4">
            {statusFilteredEvents.map((event) => (
              <SessionCard 
                key={event.id} 
                event={event} 
                isMentor={isMentor}
                onDelete={onEventDelete}
              />
            ))}
          </div>
        ) : (
          <EmptyStateDisplay date={date} showAddButton={isMentor} />
        )}
      </div>
    </div>
  );
}
