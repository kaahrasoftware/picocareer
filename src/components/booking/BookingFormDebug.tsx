
import { useState, useEffect } from "react";
import { MeetingPlatform } from "@/types/calendar";
import { DateSelector } from "./DateSelector";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";
import { SessionNote } from "./SessionNote";
import { MeetingPlatformSelector } from "./MeetingPlatformSelector";
import { RequestAvailabilityButton } from "./RequestAvailabilityButton";
import { SessionPaymentDialogDebug } from "./SessionPaymentDialogDebug";
import { useSessionTypes } from "@/hooks/useSessionTypes";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useSessionPaymentDebug } from "@/hooks/useSessionPaymentDebug";
import { useUserProfile } from "@/hooks/useUserProfile";
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

export function BookingFormDebug({ mentorId, onFormChange, onSuccess }: BookingFormProps) {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [sessionType, setSessionType] = useState<string>();
  const [note, setNote] = useState("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("Google Meet");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [telegramUsername, setTelegramUsername] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);

  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { processPaymentAndBooking } = useSessionPaymentDebug();
  const sessionTypes = useSessionTypes(mentorId, true);
  
  // Get available platforms from session types
  const selectedSessionTypeData = sessionTypes.find(type => type.id === sessionType);
  const availablePlatforms: MeetingPlatform[] = selectedSessionTypeData?.meeting_platform || ["Google Meet"];
  
  const formData = {
    date,
    selectedTime,
    sessionType,
    note,
    meetingPlatform,
    menteePhoneNumber: (meetingPlatform === "WhatsApp" || meetingPlatform === "Phone Call") ? phoneNumber : undefined,
    menteeTelegramUsername: meetingPlatform === "Telegram" ? telegramUsername : undefined,
  };

  useEffect(() => {
    onFormChange(formData);
  }, [date, selectedTime, sessionType, note, meetingPlatform, phoneNumber, telegramUsername]);

  // Reset time selection when date changes
  useEffect(() => {
    setSelectedTime(undefined);
  }, [date]);

  const handleContinueToPayment = () => {
    if (!date || !selectedTime || !sessionType) return;
    setShowPaymentDialog(true);
  };

  const handleConfirmPayment = async () => {
    if (!profile?.full_name) return;

    await processPaymentAndBooking({
      mentorId,
      mentorName: "Mentor", // This should be passed as prop or fetched
      menteeName: profile.full_name,
      formData,
      onSuccess,
      onError: (error) => {
        console.error('Booking error:', error);
      }
    });
  };

  const canProceedToPayment = date && selectedTime && sessionType;

  return (
    <>
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
                selectedSessionType={sessionTypes.find(type => type.id === sessionType)}
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
            disabled={!canProceedToPayment}
            onClick={handleContinueToPayment}
          >
            Continue to Payment (25 Tokens) - Debug Mode
          </Button>

          {/* Request Availability Button */}
          <RequestAvailabilityButton
            mentorId={mentorId}
            userId={session?.user?.id}
            onRequestComplete={() => {
              console.log('Availability request completed');
            }}
          />
        </div>
      </div>

      {/* Payment Dialog */}
      <SessionPaymentDialogDebug
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        onConfirmPayment={handleConfirmPayment}
        sessionDetails={{
          mentorName: "Mentor", // This should be passed as prop
          date: date || new Date(),
          time: selectedTime || "",
          sessionType: sessionTypes.find(type => type.id === sessionType)?.type || ""
        }}
      />
    </>
  );
}
