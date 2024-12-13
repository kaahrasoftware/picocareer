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
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const sessionTypes = useSessionTypes(mentor.id, open);
  const availableTimeSlots = useAvailableTimeSlots(date, mentor.id);
  const bookSession = useBookSession();

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType || !mentor.id) return;

    const success = await bookSession({
      mentorId: mentor.id,
      date,
      selectedTime,
      sessionTypeId: sessionType,
      note,
    });

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-picocareer-dark text-white max-w-4xl">
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
            {date && (
              <TimeSlotSelector
                date={date}
                availableTimeSlots={availableTimeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
              />
            )}

            <SessionTypeSelector
              sessionTypes={sessionTypes}
              onSessionTypeSelect={setSessionType}
            />

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
            disabled={!date || !selectedTime || !sessionType || !mentor.id}
          >
            Book Session
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}