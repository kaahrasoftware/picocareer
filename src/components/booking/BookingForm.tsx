
import { useState, useEffect } from "react";
import { MeetingPlatform } from "@/types/calendar";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionNote } from "./SessionNote";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BookingFormProps {
  mentorId: string;
  onFormChange: (formData: {
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
    menteePhoneNumber?: string;
    menteeTelegramUsername?: string;
  }) => void;
  onSuccess: () => void;
}

export function BookingForm({ mentorId, onFormChange, onSuccess }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("Google Meet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionTypes = useSessionTypes(mentorId, true);
  const selectedSessionTypeDetails = sessionTypes.find(type => type.id === sessionType);
  const availablePlatforms = selectedSessionTypeDetails?.meeting_platform || [];

  useEffect(() => {
    onFormChange({
      date,
      selectedTime,
      sessionType,
      note,
      meetingPlatform,
      menteePhoneNumber: (meetingPlatform === "WhatsApp" || meetingPlatform === "Phone Call") ? phoneNumber : undefined,
      menteeTelegramUsername: meetingPlatform === "Telegram" ? telegramUsername : undefined,
    });
  }, [date, selectedTime, sessionType, note, meetingPlatform, phoneNumber, telegramUsername]);

  const handleSubmit = async () => {
    if (!date || !selectedTime || !sessionType) return;
    
    setIsSubmitting(true);
    try {
      await onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset time selection when date changes
  useEffect(() => {
    setSelectedTime(undefined);
  }, [date]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Left column - Calendar */}
      <div className="bg-white/5 rounded-lg p-4">
        <DateSelector
          selectedDate={date}
          onDateSelect={setDate}
          mentorId={mentorId}
        />
      </div>

      {/* Right column - Form elements */}
      <div className="space-y-4">
        {sessionTypes.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <SessionTypeSelector
              sessionTypes={sessionTypes}
              onSessionTypeSelect={setSessionType}
            />
          </div>
        )}

        {date && sessionType && (
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
          <div className="bg-white/5 rounded-lg p-4">
            <MeetingPlatformSelector
              value={meetingPlatform}
              onValueChange={setMeetingPlatform}
              availablePlatforms={availablePlatforms}
            />

            {(meetingPlatform === "WhatsApp" || meetingPlatform === "Phone Call") && (
              <div className="mt-4">
                <Label htmlFor="phoneNumber">Phone Number (with country code)</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="mt-1"
                />
              </div>
            )}

            {meetingPlatform === "Telegram" && (
              <div className="mt-4">
                <Label htmlFor="telegramUsername">Telegram Username</Label>
                <Input
                  id="telegramUsername"
                  type="text"
                  placeholder="@username"
                  value={telegramUsername}
                  onChange={(e) => {
                    let username = e.target.value;
                    if (!username.startsWith('@') && username !== '') {
                      username = '@' + username;
                    }
                    setTelegramUsername(username);
                  }}
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-white/5 rounded-lg p-4">
          <SessionNote
            note={note}
            onNoteChange={setNote}
          />
        </div>

        <Button
          className="w-full"
          disabled={!date || !selectedTime || !sessionType || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? "Booking..." : "Book Session"}
        </Button>
      </div>
    </div>
  );
}
