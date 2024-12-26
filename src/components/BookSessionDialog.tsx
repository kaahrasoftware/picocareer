import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateSelector } from "./booking/DateSelector";
import { TimeSlotSelector } from "./booking/TimeSlotSelector";
import { SessionTypeSelector } from "./booking/SessionTypeSelector";
import { SessionNote } from "./booking/SessionNote";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useBookSession } from "@/hooks/useBookSession";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const availableTimeSlots = useAvailableTimeSlots(date, mentor.id);
  const bookSession = useBookSession();

  const selectedSessionTypeDetails = sessionTypes.find(type => type.id === sessionType);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType || !mentor.id) return;
    
    setIsSubmitting(true);
    try {
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

      // Create Google Meet link if selected
      if (meetingPlatform === 'google_meet') {
        const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
          body: { sessionId: sessionResult.sessionId }
        });

        if (meetError) {
          console.error('Error creating meet link:', meetError);
          toast({
            title: "Warning",
            description: "Session booked, but there was an issue creating the meeting link.",
            variant: "destructive"
          });
        }
      }

      // Schedule notifications and send confirmation emails
      const { error: notificationError } = await supabase.functions.invoke('schedule-session-notifications', {
        body: { sessionId: sessionResult.sessionId }
      });

      // Send confirmation emails
      const { error: emailError } = await supabase.functions.invoke('send-session-email', {
        body: { 
          sessionId: sessionResult.sessionId,
          type: 'confirmation'
        }
      });

      if (notificationError || emailError) {
        console.error('Error with notifications/emails:', { notificationError, emailError });
        toast({
          title: "Session Booked",
          description: "Session booked successfully, but there was an issue sending notifications.",
          variant: "default"
        });
      } else {
        toast({
          title: "Session Booked",
          description: "Session booked successfully! Check your email for confirmation details.",
          variant: "default"
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error('Error booking session:', error);
      toast({
        title: "Error",
        description: "Failed to book session. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                availableTimeSlots={availableTimeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                selectedSessionType={selectedSessionTypeDetails}
              />
            )}

            <div>
              <h4 className="font-semibold mb-2">Meeting Platform</h4>
              <Select 
                value={meetingPlatform} 
                onValueChange={(value: MeetingPlatform) => setMeetingPlatform(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select meeting platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_meet">Google Meet</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <SessionNote
              note={note}
              onNoteChange={setNote}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!date || !selectedTime || !sessionType || !mentor.id || isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Book Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}