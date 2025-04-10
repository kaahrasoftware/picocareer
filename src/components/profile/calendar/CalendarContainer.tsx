
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { AvailabilitySection } from "./AvailabilitySection";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarGrid } from "./CalendarGrid";
import { EventsSidebar } from "./EventsSidebar";
import { EventsSidebarHeader } from "./EventsSidebarHeader";
import { CalendarEvent } from "@/types/calendar";
import { MentorAvailabilityForm } from "./MentorAvailabilityForm";
import { useDisclosure } from "@/hooks/useDisclosure";
import { Button } from "@/components/ui/button";
import { CalendarPlus } from "lucide-react";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useEventActions } from "@/hooks/useEventActions";
import { SessionDetailView } from "./SessionDetailView";
import { RescheduleSessionDialog } from "./dialog/RescheduleSessionDialog";
import { CancelSessionDialog } from "./dialog/CancelSessionDialog";
import { SessionReminderDialog } from "./dialog/SessionReminderDialog";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";

interface CalendarContainerProps {
  isMentor: boolean;
  profileId: string;
}

export function CalendarContainer({ isMentor, profileId }: CalendarContainerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { isOpen: isFormOpen, onOpen: openForm, onClose: closeForm } = useDisclosure();
  const { data: events = [], refetch: refetchEvents, isLoading } = useSessionEvents();
  
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

  // Filter the events based on the selected date
  const filteredEvents = events.filter(event => {
    if (!event.start_time) return false;
    
    const eventDate = new Date(event.start_time);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Show the event form when clicking the "Add Availability" button
  const handleAddAvailability = () => {
    openForm();
  };

  // Refresh events when forms are closed
  useEffect(() => {
    if (!isFormOpen) {
      refetchEvents();
    }
  }, [isFormOpen, refetchEvents]);

  // Add user ID to events for SessionCard component
  const eventsWithUserId = events.map(event => ({
    ...event,
    user_id: profileId
  }));

  // When a session is rescheduled, cancelled, marked as complete, etc.
  const handleEventChange = () => {
    refetchEvents();
    handleDialogClose();
  };

  const renderDateCellContent = (date: Date) => {
    // Find events for this date
    const dateEvents = events.filter(event => {
      if (!event.start_time) return false;
      
      const eventDate = new Date(event.start_time);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
    
    // Return dot indicators for the events
    return (
      <div className="flex gap-0.5 justify-center mt-1">
        {dateEvents.length > 0 && (
          <>
            {dateEvents.some(e => e.status === "scheduled") && (
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
            )}
            {dateEvents.some(e => e.status === "completed") && (
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
            )}
            {dateEvents.some(e => e.status === "cancelled" || e.status === "no_show") && (
              <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div>
      <CalendarHeader 
        isMentor={isMentor} 
        selectedMonth={format(selectedDate, "MMMM yyyy")} 
      />
      
      <div className="grid grid-cols-1 md:grid-cols-7 gap-6 mt-6">
        <div className="md:col-span-5">
          <div className="p-4 bg-background rounded-lg border shadow-sm">
            <CalendarGrid 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
              renderDateCellContent={renderDateCellContent}
            />
          </div>
          
          {isMentor && (
            <div className="mt-4">
              <Button 
                onClick={handleAddAvailability} 
                variant="default"
                className="w-full"
              >
                <CalendarPlus className="mr-2 h-4 w-4" />
                Add Availability
              </Button>
            </div>
          )}
          
          {/* MentorAvailabilityForm dialog */}
          {isFormOpen && (
            <MentorAvailabilityForm
              isOpen={isFormOpen}
              onClose={closeForm}
              profileId={profileId}
              selectedDate={selectedDate}
            />
          )}
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-background rounded-lg border shadow-sm h-full">
            <EventsSidebarHeader 
              date={selectedDate} 
            />
            
            <EventsSidebar
              events={eventsWithUserId}
              onEventJoin={handleJoin}
              onEventReschedule={handleReschedule}
              onEventCancel={handleCancel}
              onEventReminder={handleReminder}
              onEventComplete={handleMarkComplete}
              onEventFeedback={handleFeedback}
              isMentor={isMentor}
              userId={profileId}
            />
          </div>
        </div>
      </div>
      
      {/* Dialogs */}
      {showReschedule && selectedEvent && (
        <RescheduleSessionDialog
          isOpen={showReschedule}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          currentScheduledTime={new Date(selectedEvent.start_time as string)}
          duration={selectedEvent.session_details?.session_type?.duration || 60}
          onSuccess={handleEventChange}
        />
      )}
      
      {showCancel && selectedEvent && (
        <CancelSessionDialog
          isOpen={showCancel}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          scheduledTime={new Date(selectedEvent.start_time as string)}
          withParticipant={selectedEvent.title.split(" with ")[1]}
          onSuccess={handleEventChange}
        />
      )}
      
      {showReminder && selectedEvent && (
        <SessionReminderDialog
          isOpen={showReminder}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          participantName={selectedEvent.title.split(" with ")[1]}
          onSuccess={handleEventChange}
        />
      )}
      
      {showFeedback && selectedEvent && selectedEvent.session_details && (
        <SessionFeedbackDialog
          isOpen={showFeedback}
          onClose={handleDialogClose}
          sessionId={selectedEvent.id}
          feedbackType={isMentor ? 'mentor_feedback' : 'mentee_feedback'}
          fromProfileId={profileId}
          toProfileId={isMentor 
            ? selectedEvent.session_details?.mentee?.id 
            : selectedEvent.session_details?.mentor?.id}
        />
      )}
    </div>
  );
}
