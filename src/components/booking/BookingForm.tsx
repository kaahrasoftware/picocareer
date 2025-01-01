import { useState, useEffect } from "react";
import { MeetingPlatform } from "@/types/calendar";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionNote } from "./SessionNote";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { useSessionTypes } from "@/hooks/useSessionTypes";

interface BookingFormProps {
  mentorId: string;
  onFormChange: (formData: {
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
  }) => void;
}

export function BookingForm({ mentorId, onFormChange }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("Google Meet");

  const sessionTypes = useSessionTypes(mentorId, true);
  const selectedSessionTypeDetails = sessionTypes.find(type => type.id === sessionType);

  // Update parent component whenever form values change
  const handleChange = () => {
    onFormChange({
      date,
      selectedTime,
      sessionType,
      note,
      meetingPlatform
    });
  };

  // Call handleChange whenever any value changes
  useEffect(() => {
    handleChange();
  }, [date, selectedTime, sessionType, note, meetingPlatform]);

  return (
    <div className="space-y-6">
      <DateSelector
        date={date}
        onDateSelect={setDate}
        mentorId={mentorId}
      />

      <SessionTypeSelector
        sessionTypes={sessionTypes}
        onSessionTypeSelect={setSessionType}
      />

      {date && (
        <TimeSlotSelector
          date={date}
          mentorId={mentorId}
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
  );
}