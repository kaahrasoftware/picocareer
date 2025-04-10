
import { isSameDay, isValid } from "date-fns";
import { Button } from "@/components/ui/button";
import { SessionCard } from "./SessionCard";
import { EventsSidebarHeader } from "./EventsSidebarHeader";
import { EmptyStateDisplay } from "./EmptyStateDisplay";
import { EventDialogs } from "./EventDialogs";
import type { CalendarEvent } from "@/types/calendar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useEventActions } from "@/hooks/useEventActions";

interface EventsSidebarProps {
  date: Date;
  events: CalendarEvent[];
  isMentor?: boolean;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (event: CalendarEvent) => void;
}

export function EventsSidebar({
  date,
  events,
  isMentor = false,
  onEventClick,
  onEventDelete,
}: EventsSidebarProps) {
  const { session } = useAuthSession();
  const { cancelSession } = useSessionManagement();
  const userId = session?.user.id;
  
  const {
    selectedEvent,
    showReschedule,
    showCancel,
    showReminder,
    showFeedback,
    handleReschedule,
    handleCancel,
    handleReminder,
    handleFeedback,
    handleJoin,
    handleMarkComplete,
    handleDialogClose
  } = useEventActions();

  // Make sure date is valid before filtering
  const isValidDate = date && isValid(date);
  
  const filteredEvents = events.filter((event) =>
    isValidDate && event.start_time ? 
      isSameDay(new Date(event.start_time), date) : 
      false
  );

  const handleEventDeleted = () => {
    if (selectedEvent && onEventDelete) {
      onEventDelete(selectedEvent);
    }
    handleDialogClose();
  };

  const handleCompleteSession = async (event: CalendarEvent) => {
    const success = await handleMarkComplete(event);
    if (success && onEventDelete) {
      onEventDelete(event);
    }
  };

  return (
    <div className="border rounded-md p-4 w-full lg:w-[700px] lg:min-w-[500px]">
      <EventsSidebarHeader date={date} events={filteredEvents} />

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredEvents.length === 0 ? (
          <EmptyStateDisplay date={date} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredEvents.map((event) => {
              // Add the user ID to the event object for user role checking in SessionCard
              const eventWithUserId = { ...event, user_id: userId };
              
              return (
                <SessionCard
                  key={event.id}
                  event={eventWithUserId}
                  onClick={onEventClick ? () => onEventClick(event) : undefined}
                  onJoin={handleJoin}
                  onReschedule={handleReschedule}
                  onCancel={handleCancel}
                  onReminder={isMentor && event.session_details?.mentor.id === userId ? handleReminder : undefined}
                  onMarkComplete={isMentor && event.session_details?.mentor.id === userId ? handleCompleteSession : undefined}
                  onFeedback={handleFeedback}
                />
              );
            })}
          </div>
        )}
      </div>

      <EventDialogs 
        selectedEvent={selectedEvent}
        showReschedule={showReschedule}
        showCancel={showCancel}
        showReminder={showReminder}
        showFeedback={showFeedback}
        userId={userId}
        isMentor={isMentor}
        onClose={handleEventDeleted}
      />
    </div>
  );
}
