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
  const availablePlatforms = selectedSessionTypeDetails?.meeting_platform || [];

  // Reset meeting platform when session type changes
  useEffect(() => {
    if (availablePlatforms.length > 0) {
      setMeetingPlatform(availablePlatforms[0]);
    }
  }, [sessionType, availablePlatforms]);

  // Update parent component whenever form values change
  useEffect(() => {
    onFormChange({
      date,
      selectedTime,
      sessionType,
      note,
      meetingPlatform
    });
  }, [date, selectedTime, sessionType, note, meetingPlatform]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left column - Calendar */}
      <div className="bg-white/5 rounded-lg p-4">
        <DateSelector
          date={date}
          onDateSelect={setDate}
          mentorId={mentorId}
        />
      </div>

      {/* Right column - Form elements */}
      <div className="space-y-4">
        <div className="bg-white/5 rounded-lg p-4 transition-all duration-300">
          <h3 className="text-lg font-semibold mb-4">Session Details</h3>
          <div className="space-y-6">
            <div className="bg-white/5 rounded-lg p-4">
              <SessionTypeSelector
                sessionTypes={sessionTypes}
                onSessionTypeSelect={(type) => {
                  setSessionType(type);
                  setMeetingPlatform(availablePlatforms[0] || "Google Meet");
                }}
              />
            </div>

            {date && (
              <div className="bg-white/5 rounded-lg p-4">
                <TimeSlotSelector
                  date={date}
                  mentorId={mentorId}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  selectedSessionType={selectedSessionTypeDetails}
                />
              </div>
            )}

            {sessionType && availablePlatforms.length > 0 && (
              <div 
                className="bg-white/5 rounded-lg p-4 transform transition-all duration-300 ease-in-out"
                style={{
                  opacity: sessionType ? 1 : 0,
                  transform: sessionType ? 'translateY(0)' : 'translateY(-10px)'
                }}
              >
                <MeetingPlatformSelector
                  value={meetingPlatform}
                  onValueChange={setMeetingPlatform}
                  onGoogleAuthErrorClear={() => {}}
                  availablePlatforms={availablePlatforms}
                />
              </div>
            )}

            <div className="bg-white/5 rounded-lg p-4">
              <SessionNote
                note={note}
                onNoteChange={setNote}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}