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
      });

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to book session');
      }

      // Schedule notifications and send confirmation emails
      const { error: notificationError } = await supabase.functions.invoke('schedule-session-notifications', {
        body: { sessionId: sessionResult.sessionId }
      });

      if (notificationError) {
        console.error('Error scheduling notifications:', notificationError);
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