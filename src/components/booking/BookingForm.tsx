import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { useBookSession } from "@/hooks/useBookSession";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { SessionType } from "@/types/session";

interface BookingFormProps {
  mentorId: string;
  onSuccess: () => void;
}

export function BookingForm({ mentorId, onSuccess }: BookingFormProps) {
  const [selectedSessionType, setSelectedSessionType] = useState<SessionType | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { bookSession, isLoading } = useBookSession();
  const { data: sessionTypes } = useSessionTypes(mentorId);

  const handleBookSession = async () => {
    if (!selectedDate || !selectedTime || !selectedSessionType) return;

    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(parseInt(selectedTime.split(':')[0]), parseInt(selectedTime.split(':')[1]));

    const success = await bookSession(mentorId, selectedSessionType.id, scheduledAt.toISOString(), "google_meet");
    if (success) {
      onSuccess();
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Book a Session</h3>
      <MeetingPlatformSelector
        value="google_meet"
        onValueChange={() => {}}
        availablePlatforms={["google_meet", "whatsapp", "telegram"]}
      />
      <TimeSlotSelector
        date={selectedDate}
        mentorId={mentorId}
        selectedTime={selectedTime}
        onTimeSelect={setSelectedTime}
        selectedSessionType={selectedSessionType}
        title="Select Time"
      />
      <Button
        onClick={handleBookSession}
        disabled={isLoading || !selectedSessionType || !selectedTime}
      >
        {isLoading ? "Booking..." : "Book Session"}
      </Button>
    </div>
  );
}
