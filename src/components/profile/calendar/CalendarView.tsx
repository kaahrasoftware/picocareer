import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { AvailabilitySection } from "./AvailabilitySection";
import { EventsSidebar } from "./EventsSidebar";
import { SessionDetailsDialog } from "./SessionDetailsDialog";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";
import { useSessionEvents } from "@/hooks/useSessionEvents";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

interface CalendarViewProps {
  isMentor: boolean;
}

export function CalendarView({ isMentor }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const { session } = useAuthSession();
  const { toast } = useToast();
  const { data: events = [], refetch: refetchEvents } = useSessionEvents();

  const handleCancelSession = async () => {
    if (!selectedSession?.session_details) return;

    try {
      // Update the session status in the database
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ 
          status: 'cancelled'
        })
        .eq('id', selectedSession.session_details.id);

      if (error) throw error;

      // Create notifications for both mentor and mentee
      const notifications = [
        {
          profile_id: selectedSession.session_details.mentor.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentee.full_name} has been cancelled.`,
          type: 'session_cancelled' as const,
          action_url: '/profile?tab=calendar',
          category: 'mentorship' as const
        },
        {
          profile_id: selectedSession.session_details.mentee.id,
          title: 'Session Cancelled',
          message: `Session with ${selectedSession.session_details.mentor.full_name} has been cancelled.`,
          type: 'session_cancelled' as const,
          action_url: '/profile?tab=calendar',
          category: 'mentorship' as const
        }
      ];

      // Insert notifications
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert(notifications);

      if (notificationError) throw notificationError;

      // Send cancellation emails
      const { error: emailError } = await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: selectedSession.session_details.id,
          type: 'cancellation'
        }
      });

      if (emailError) {
        console.error('Error sending cancellation emails:', emailError);
      }

      toast({
        title: "Session cancelled",
        description: "The session has been cancelled and notifications have been sent.",
      });

      // Close the dialog and reset state
      setSelectedSession(null);
      
      // Refresh events
      refetchEvents();

    } catch (error) {
      console.error('Error cancelling session:', error);
      toast({
        title: "Error",
        description: "Failed to cancel the session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEventDelete = (deletedEvent: CalendarEvent) => {
    refetchEvents();
  };

  const handleFeedbackSubmit = () => {
    setShowFeedback(false);
    refetchEvents();
  };

  return (
    <div className="flex gap-4">
      <div className="w-fit">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
        />
        {isMentor && selectedDate && (
          <AvailabilitySection 
            selectedDate={selectedDate}
            onAvailabilityChange={refetchEvents}
          />
        )}
      </div>

      {selectedDate && (
        <div className="w-fit">
          <EventsSidebar
            date={selectedDate}
            events={events}
            isMentor={isMentor}
            onEventClick={setSelectedSession}
            onEventDelete={handleEventDelete}
          />
        </div>
      )}

      <SessionDetailsDialog
        session={selectedSession}
        onClose={() => setSelectedSession(null)}
        onCancel={handleCancelSession}
        onFeedback={() => setShowFeedback(true)}
      />

      {showFeedback && selectedSession?.session_details && (
        <SessionFeedbackDialog
          sessionId={selectedSession.session_details.id}
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          feedbackType={isMentor ? 'mentor_feedback' : 'mentee_feedback'}
          fromProfileId={session?.user?.id || ''}
          toProfileId={isMentor ? 
            selectedSession.session_details.mentee.id : 
            selectedSession.session_details.mentor.id}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
}