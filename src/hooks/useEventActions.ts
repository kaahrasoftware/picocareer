
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { CalendarEvent } from "@/types/calendar";

export function useEventActions() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const { toast } = useToast();

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

  const handleFeedback = (event: CalendarEvent) => {
    // Only process if feedback hasn't been provided yet
    if (!event.session_details?.has_feedback) {
      setSelectedEvent(event);
      setShowFeedback(true);
    }
  };

  const handleJoin = (event: CalendarEvent) => {
    if (event.session_details?.meeting_link) {
      window.open(event.session_details.meeting_link, '_blank');
    } else {
      toast({
        title: "No meeting link available",
        description: "The meeting link has not been set up yet.",
        variant: "destructive",
      });
    }
  };

  const handleMarkComplete = async (event: CalendarEvent) => {
    try {
      if (!event.id) {
        return;
      }
      
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ status: 'completed' })
        .eq('id', event.id);
      
      if (error) throw error;
      
      toast({
        title: 'Session updated',
        description: 'Session has been marked as completed.',
      });
      
      return true;
    } catch (error: any) {
      console.error('Error updating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session status.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleDialogClose = () => {
    setShowReschedule(false);
    setShowCancel(false);
    setShowReminder(false);
    setShowFeedback(false);
    setSelectedEvent(null);
  };

  return {
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
  };
}
