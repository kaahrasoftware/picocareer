import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DateSelector } from "./booking/DateSelector";
import { TimeSlotSelector } from "./booking/TimeSlotSelector";
import { SessionTypeSelector } from "./booking/SessionTypeSelector";
import { SessionNote } from "./booking/SessionNote";
import { MeetingPlatformSelector } from "./booking/MeetingPlatformSelector";
import { BookingConfirmation } from "./booking/BookingConfirmation";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { useBookSession } from "@/hooks/useBookSession";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type MeetingPlatform = "google_meet" | "whatsapp" | "telegram";

interface BookSessionDialogProps {
  mentor: {
    id: string;
    name: string;
    imageUrl: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookSessionDialog({ mentor, open, onOpenChange }: BookSessionDialogProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("google_meet");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const { toast } = useToast();

  const sessionTypes = useSessionTypes(mentor.id, open);
  const bookSession = useBookSession();

  const selectedSessionTypeDetails = sessionTypes.find(type => type.id === sessionType);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType || !mentor.id) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Booking session with:', { date, selectedTime, sessionType, meetingPlatform });
      
      // Book the session first
      const sessionResult = await bookSession({
        mentorId: mentor.id,
        date,
        selectedTime,
        sessionTypeId: sessionType,
        note,
        meetingPlatform,
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      console.log('Session booked successfully:', sessionResult);

      // If Google Meet is selected, create the meeting link
      if (meetingPlatform === 'google_meet') {
        try {
          console.log('Creating Google Meet link for session:', sessionResult.sessionId);
          
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { sessionId: sessionResult.sessionId }
          });

          if (meetError) {
            console.error('Error creating meet link:', meetError);
            toast({
              title: "Google Meet Error",
              description: "Session booked, but there was an issue creating the meeting link. We'll send you the link via email shortly.",
              variant: "destructive"
            });
          } else {
            console.log('Meet link created successfully:', meetData);
          }
        } catch (meetError) {
          console.error('Error with Google Meet integration:', meetError);
          toast({
            title: "Google Meet Error",
            description: "Session booked, but there was an issue with Google Meet integration. We'll send you the link via email shortly.",
            variant: "destructive"
          });
        }
      }

      // Schedule notifications and send confirmation emails
      try {
        console.log('Scheduling notifications and sending emails');
        
        await Promise.all([
          supabase.functions.invoke('schedule-session-notifications', {
            body: { sessionId: sessionResult.sessionId }
          }),
          supabase.functions.invoke('send-session-email', {
            body: { 
              sessionId: sessionResult.sessionId,
              type: 'confirmation'
            }
          })
        ]).catch(error => {
          console.error('Error with notifications/emails:', error);
          toast({
            title: "Notification Error",
            description: "Session booked successfully, but there was an issue sending notifications.",
            variant: "destructive"
          });
        });
      } catch (notificationError) {
        console.error('Error with notifications/emails:', notificationError);
        toast({
          title: "Session Booked",
          description: "Session booked successfully, but there was an issue sending notifications.",
          variant: "destructive"
        });
      }

      toast({
        title: "Session Booked",
        description: "Session booked successfully! Check your email for confirmation details.",
        variant: "default"
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error booking session:', error);
      toast({
        title: "Booking Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = !!date && !!selectedTime && !!sessionType && !!mentor.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Book a Session with {mentor.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DateSelector
            date={date}
            onDateSelect={setDate}
            userTimezone={userTimezone}
            mentorId={mentor.id}
          />

          <div className="space-y-6">
            <SessionTypeSelector
              sessionTypes={sessionTypes}
              onSessionTypeSelect={setSessionType}
            />

            {date && (
              <TimeSlotSelector
                date={date}
                mentorId={mentor.id}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                selectedSessionType={selectedSessionTypeDetails}
              />
            )}

            <MeetingPlatformSelector
              value={meetingPlatform}
              onValueChange={setMeetingPlatform}
              onGoogleAuthErrorClear={() => {}}
            />

            <SessionNote
              note={note}
              onNoteChange={setNote}
            />
          </div>
        </div>

        <BookingConfirmation
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          onConfirm={handleSubmit}
          isValid={isValid}
          googleAuthError={false}
        />
      </DialogContent>
    </Dialog>
  );
}