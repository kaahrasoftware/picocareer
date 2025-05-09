
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SessionInfo } from "./dialog/SessionInfo";
import { SessionActions } from "./dialog/SessionActions";
import { SessionFeedbackDialog } from "../feedback/SessionFeedbackDialog";
import type { CalendarEvent } from "@/types/calendar";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserSettings } from "@/hooks/useUserSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SessionDetailsDialogProps {
  session: CalendarEvent | null;
  onClose: () => void;
  onCancel: () => Promise<void>;
}

export function SessionDetailsDialog({
  session,
  onClose,
  onCancel,
}: SessionDetailsDialogProps) {
  const { session: authSession } = useAuthSession();
  const [showFeedback, setShowFeedback] = useState(false);
  const { getSetting } = useUserSettings(authSession?.user?.id || '');
  const userTimezone = getSetting('timezone');

  const { data: existingFeedback } = useQuery({
    queryKey: ['session-feedback', session?.session_details?.id],
    queryFn: async () => {
      if (!session?.session_details?.id || !authSession?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('session_feedback')
        .select('*')
        .eq('session_id', session.session_details.id)
        .eq('from_profile_id', authSession.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching feedback:', error);
        return null;
      }

      return data;
    },
    enabled: !!session?.session_details?.id && !!authSession?.user?.id
  });

  if (!session?.session_details) return null;

  const isMentor = authSession?.user?.id === session.session_details.mentor.id;
  const feedbackType = isMentor ? 'mentor_feedback' : 'mentee_feedback';
  
  // Calculate if session is in the past
  const isPastSession = new Date(session.session_details.scheduled_at) < new Date();

  // Can provide feedback if session is completed or is in the past, and feedback hasn't been provided yet
  const canProvideFeedback = (session.session_details.status === 'completed' || isPastSession) && !existingFeedback;

  // Function to refetch sessions
  const refetchSessions = () => {
    // This would normally refetch calendar events, but for this dialog we'll just close it
    onClose();
  };

  return (
    <>
      <Dialog open={!!session} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
          <SessionInfo session={session} userTimezone={userTimezone || 'UTC'} />

          {session.session_details && (
            <SessionActions
              session={session.session_details}
              onClose={onClose}
              refetchSessions={refetchSessions}
            />
          )}

          {(session.session_details.status === 'completed' || isPastSession) && (
            <div className="flex justify-end pt-4">
              <Button 
                onClick={() => setShowFeedback(true)}
                disabled={!canProvideFeedback}
              >
                {existingFeedback ? 'Feedback Provided' : 'Provide Feedback'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {showFeedback && (
        <SessionFeedbackDialog
          sessionId={session.session_details.id}
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          feedbackType={feedbackType}
          fromProfileId={authSession?.user?.id || ''}
          toProfileId={isMentor ? session.session_details.mentee.id : session.session_details.mentor.id}
        />
      )}
    </>
  );
}
