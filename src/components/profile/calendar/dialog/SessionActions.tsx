
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { AlertCircle, Bell, CalendarX, Clock, ExternalLink, MoreHorizontal, BadgeCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { RescheduleDialog } from "./RescheduleDialog";
import { CancelSessionDialog } from "./CancelSessionDialog";
import { useUserSettings } from "@/hooks/useUserSettings";

interface SessionActionsProps {
  session: any;
  onClose: () => void;
  refetchSessions: () => void;
}

export function SessionActions({ session, onClose, refetchSessions }: SessionActionsProps) {
  const { toast } = useToast();
  const { session: authSession } = useAuthSession();
  const userId = authSession?.user?.id;
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const isMentor = userId === session.mentor.id;
  const isMentee = userId === session.mentee.id;
  const { getSetting } = useUserSettings(session.mentor.id);
  
  // Parse the session settings to check if rescheduling and cancellations are allowed
  const sessionSettingsStr = getSetting('session_settings');
  let sessionSettings = {
    allowRescheduling: true,
    rescheduleTimeLimit: 24,
    allowCancellation: true,
    cancellationTimeLimit: 24
  };
  
  try {
    if (sessionSettingsStr) {
      const parsed = JSON.parse(sessionSettingsStr);
      sessionSettings = {
        ...sessionSettings,
        ...parsed
      };
    }
  } catch (e) {
    console.error('Error parsing session settings:', e);
  }

  const hasPassedRescheduleTimeLimit = () => {
    const sessionTime = new Date(session.scheduled_at);
    const currentTime = new Date();
    const hoursDifference = (sessionTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    return hoursDifference < sessionSettings.rescheduleTimeLimit;
  };

  const hasPassedCancellationTimeLimit = () => {
    const sessionTime = new Date(session.scheduled_at);
    const currentTime = new Date();
    const hoursDifference = (sessionTime.getTime() - currentTime.getTime()) / (1000 * 60 * 60);
    return hoursDifference < sessionSettings.cancellationTimeLimit;
  };

  const isUpcoming = () => {
    const sessionTime = new Date(session.scheduled_at);
    const currentTime = new Date();
    return sessionTime > currentTime;
  };

  const canReschedule = (
    session.status === "scheduled" && 
    (isMentor || (isMentee && sessionSettings.allowRescheduling && !hasPassedRescheduleTimeLimit()))
  );

  const canCancel = (
    session.status === "scheduled" && 
    (isMentor || (isMentee && sessionSettings.allowCancellation && !hasPassedCancellationTimeLimit()))
  );

  const canSendReminder = (
    session.status === "scheduled" && 
    isMentor && 
    isUpcoming()
  );

  const markCompleted = async () => {
    if (!isMentor) return;
    
    try {
      const { error } = await supabase
        .from('mentor_sessions')
        .update({ status: 'completed' })
        .eq('id', session.id);
      
      if (error) throw error;
      
      toast({
        title: 'Session updated',
        description: 'Session has been marked as completed.',
      });
      
      refetchSessions();
      onClose();
    } catch (error) {
      console.error('Error updating session:', error);
      toast({
        title: 'Error',
        description: 'Failed to update session status.',
        variant: 'destructive',
      });
    }
  };

  const openMeetingLink = () => {
    if (session.meeting_link) {
      window.open(session.meeting_link, '_blank');
    } else {
      toast({
        title: 'No meeting link available',
        description: 'The meeting link has not been set up yet.',
        variant: 'destructive',
      });
    }
  };

  const sendReminderNow = async () => {
    if (!canSendReminder) return;
    
    setIsSendingReminder(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-session-reminder', {
        body: {
          sessionId: session.id,
          senderId: userId
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Reminder sent',
        description: 'A reminder has been sent to the mentee.',
      });
    } catch (error) {
      console.error('Error sending reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send reminder.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingReminder(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {session.meeting_link && (
            <DropdownMenuItem onClick={openMeetingLink}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Join Meeting
            </DropdownMenuItem>
          )}
          
          {canSendReminder && (
            <DropdownMenuItem onClick={sendReminderNow} disabled={isSendingReminder}>
              <Bell className="mr-2 h-4 w-4" />
              {isSendingReminder ? 'Sending...' : 'Send Reminder'}
            </DropdownMenuItem>
          )}
          
          {canReschedule && (
            <DropdownMenuItem onClick={() => setIsRescheduling(true)}>
              <Clock className="mr-2 h-4 w-4" />
              Reschedule
            </DropdownMenuItem>
          )}
          
          {canCancel && (
            <DropdownMenuItem onClick={() => setIsCancelling(true)}>
              <CalendarX className="mr-2 h-4 w-4" />
              Cancel Session
            </DropdownMenuItem>
          )}
          
          {isMentor && session.status === "scheduled" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={markCompleted}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                Mark as Completed
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isRescheduling && (
        <RescheduleDialog
          isOpen={isRescheduling}
          onClose={() => setIsRescheduling(false)}
          sessionId={session.id}
          currentScheduledTime={new Date(session.scheduled_at)}
          duration={session.session_type.duration}
        />
      )}
      
      {isCancelling && (
        <CancelSessionDialog
          isOpen={isCancelling}
          onClose={() => setIsCancelling(false)}
          sessionId={session.id}
          scheduledTime={new Date(session.scheduled_at)}
          withParticipant={isMentor ? session.mentee.full_name : session.mentor.full_name}
        />
      )}
    </>
  );
}
