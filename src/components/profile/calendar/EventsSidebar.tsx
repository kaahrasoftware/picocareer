
import { useState } from "react";
import { format, isToday, isSameDay } from "date-fns";
import { PlusCircle, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionCard } from "./SessionCard";
import { RescheduleDialog } from "./dialog/RescheduleDialog";
import { CancelDialog } from "./dialog/CancelDialog";
import { SendReminderDialog } from "./dialog/SendReminderDialog";
import type { CalendarEvent } from "@/types/calendar";
import { useAuthSession } from "@/hooks/useAuthSession";

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
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const { session } = useAuthSession();
  const userId = session?.user.id;

  const filteredEvents = events.filter((event) =>
    isSameDay(new Date(event.start_time), date)
  );

  const handleReschedule = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowReschedule(true);
  };

  const handleCancel = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowCancel(true);
  };

  const handleReminder = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowReminder(true);
  };

  const handleDialogClose = () => {
    setShowReschedule(false);
    setShowCancel(false);
    setShowReminder(false);
    setSelectedEvent(null);
  };

  const handleEventDeleted = () => {
    if (selectedEvent && onEventDelete) {
      onEventDelete(selectedEvent);
    }
    handleDialogClose();
  };

  return (
    <div className="border rounded-md p-4 w-full lg:w-auto lg:min-w-[350px]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold">
            {isToday(date)
              ? "Today's Sessions"
              : `Sessions for ${format(date, "MMMM d, yyyy")}`}
          </h3>
          <p className="text-sm text-muted-foreground">
            {filteredEvents.length === 0
              ? "No sessions scheduled"
              : `${filteredEvents.length} session${
                  filteredEvents.length === 1 ? "" : "s"
                }`}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1">
          <PlusCircle className="h-4 w-4" /> Book
        </Button>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-2 text-sm font-semibold">No Sessions</h3>
            <p className="text-sm text-muted-foreground">
              {isToday(date)
                ? "You have no sessions scheduled for today."
                : `No sessions scheduled for ${format(date, "MMMM d")}.`}
            </p>
          </div>
        ) : (
          filteredEvents.map((event) => (
            <SessionCard
              key={event.id}
              event={event}
              onClick={() => onEventClick && onEventClick(event)}
              onReschedule={handleReschedule}
              onCancel={handleCancel}
              onReminder={isMentor && event.session_details?.mentor.id === userId ? handleReminder : undefined}
            />
          ))
        )}
      </div>

      {selectedEvent && showReschedule && (
        <RescheduleDialog
          isOpen={showReschedule}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          currentScheduledTime={new Date(selectedEvent.start_time)}
          duration={selectedEvent.session_details?.session_type.duration || 60}
          mentorId={selectedEvent.session_details?.mentor.id || ''}
        />
      )}

      {selectedEvent && showCancel && (
        <CancelDialog
          isOpen={showCancel}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          onCancelled={handleEventDeleted}
        />
      )}

      {selectedEvent && showReminder && userId && (
        <SendReminderDialog
          isOpen={showReminder}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          senderId={userId}
        />
      )}
    </div>
  );
}
