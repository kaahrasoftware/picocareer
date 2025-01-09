import { Dialog } from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MeetingPlatformSelector } from "./booking/MeetingPlatformSelector";
import { TimeSlotForm } from "./booking/TimeSlotForm";
import { useBookSession } from "@/hooks/useBookSession";
import { MeetingPlatform } from "@/types/session";

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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedSessionType, setSelectedSessionType] = useState<string | undefined>(undefined);
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("google_meet");
  const { bookSession, isLoading } = useBookSession();

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) {
      // Handle missing information
      return;
    }

    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(parseInt(selectedTime.split(":")[0]), parseInt(selectedTime.split(":")[1]));

    const success = await bookSession(mentor.id, selectedSessionType, scheduledAt.toISOString(), meetingPlatform);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <h2 className="text-lg font-semibold">Book a Session with {mentor.name}</h2>
        <img src={mentor.imageUrl} alt={mentor.name} className="w-16 h-16 rounded-full" />
        
        <TimeSlotForm
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          selectedSessionType={selectedSessionType}
          onSessionTypeSelect={setSelectedSessionType}
        />

        <MeetingPlatformSelector
          value={meetingPlatform}
          onValueChange={setMeetingPlatform}
          availablePlatforms={["google_meet", "whatsapp", "telegram", "phone_call"]}
        />

        <Button onClick={handleBookSession} disabled={isLoading}>
          {isLoading ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </Dialog>
  );
}
