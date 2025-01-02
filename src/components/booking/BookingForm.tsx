import { useState, useEffect } from "react";
import { MeetingPlatform } from "@/types/calendar";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionNote } from "./SessionNote";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
}

export function BookingForm({ mentorId, onFormChange }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("Google Meet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");

  const sessionTypes = useSessionTypes(mentorId, true);
  const selectedSessionTypeDetails = sessionTypes.find(type => type.id === sessionType);
  const availablePlatforms = selectedSessionTypeDetails?.meeting_platform || [];

  // Reset meeting platform when session type changes
  useEffect(() => {
    if (availablePlatforms.length > 0) {
      setMeetingPlatform(availablePlatforms[0]);
      setPhoneNumber("");
      setTelegramUsername("");
    }
  }, [sessionType, availablePlatforms]);

  // Update parent component whenever form values change
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