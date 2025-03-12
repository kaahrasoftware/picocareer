
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { DateSelector } from "./DateSelector";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MeetingPlatform } from "@/types/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { SessionType } from "@/types/database/mentors";
import { format } from "date-fns";

interface BookingFormProps {
  mentorId: string;
  onFormChange: (data: {
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
    menteePhoneNumber?: string;
    menteeTelegramUsername?: string;
    mentorTimezone?: string;
  }) => void;
  onMentorTimezoneChange?: (timezone: string) => void;
}

export function BookingForm({ mentorId, onFormChange, onMentorTimezoneChange }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [sessionTypeId, setSessionTypeId] = useState<string | undefined>();
  const [note, setNote] = useState<string>("");
  const [meetingPlatform, setMeetingPlatform] = useState<MeetingPlatform>("Google Meet");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [telegramUsername, setTelegramUsername] = useState<string>("");
  const [mentorTimezone, setMentorTimezone] = useState<string>("");

  // Query to get session types for this mentor
  const { data: sessionTypes } = useQuery({
    queryKey: ['session-types', mentorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', mentorId);
      
      if (error) throw error;
      return data;
    },
    enabled: !!mentorId,
  });

  const selectedSessionType = sessionTypes?.find(type => type.id === sessionTypeId);
  
  const handleMeetingPlatformChange = (value: string) => {
    setMeetingPlatform(value as MeetingPlatform);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleMentorTimezoneUpdate = (timezone: string) => {
    setMentorTimezone(timezone);
    if (onMentorTimezoneChange) {
      onMentorTimezoneChange(timezone);
    }
  };

  // Update parent component whenever form data changes
  useEffect(() => {
    onFormChange({
      date: selectedDate,
      selectedTime,
      sessionType: sessionTypeId,
      note,
      meetingPlatform,
      menteePhoneNumber: phoneNumber || undefined,
      menteeTelegramUsername: telegramUsername || undefined,
      mentorTimezone
    });
  }, [selectedDate, selectedTime, sessionTypeId, note, meetingPlatform, phoneNumber, telegramUsername, mentorTimezone, onFormChange]);

  // Get the available meeting platforms for the selected session type
  const availablePlatforms = selectedSessionType?.meeting_platform || ['Google Meet'];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Session Type Selector */}
      <div>
        <Label htmlFor="session-type" className="text-sm sm:text-base font-medium mb-1 sm:mb-2 block">
          Session Type
        </Label>
        <Select value={sessionTypeId} onValueChange={setSessionTypeId}>
          <SelectTrigger id="session-type" className="text-sm">
            <SelectValue placeholder="Select a session type" />
          </SelectTrigger>
          <SelectContent>
            {sessionTypes?.map((type) => (
              <SelectItem key={type.id} value={type.id} className="text-sm">
                {type.type} ({type.duration} minutes)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sessionTypeId && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Date Selection */}
          <Card className="overflow-hidden">
            <CardContent className="p-3 sm:pt-6 sm:p-6">
              <DateSelector
                mentorId={mentorId}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </CardContent>
          </Card>

          {/* Time Selection */}
          {selectedDate && (
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:pt-6 sm:p-6">
                <TimeSlotSelector
                  date={selectedDate}
                  mentorId={mentorId}
                  selectedTime={selectedTime}
                  onTimeSelect={handleTimeSelect}
                  selectedSessionType={selectedSessionType as SessionType}
                  onMentorTimezoneChange={handleMentorTimezoneUpdate}
                />
                {selectedTime && (
                  <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-primary/10 rounded-md">
                    <p className="text-xs sm:text-sm font-medium">
                      Selected: {selectedDate && format(selectedDate, 'MMMM d, yyyy')} at {selectedTime}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Meeting Platform */}
      {selectedTime && (
        <>
          <div>
            <Label htmlFor="meeting-platform" className="text-sm sm:text-base font-medium mb-1 sm:mb-2 block">
              Meeting Platform
            </Label>
            <Select value={meetingPlatform} onValueChange={handleMeetingPlatformChange}>
              <SelectTrigger id="meeting-platform" className="text-sm">
                <SelectValue placeholder="Select meeting platform" />
              </SelectTrigger>
              <SelectContent>
                {availablePlatforms.map((platform) => (
                  <SelectItem key={platform} value={platform} className="text-sm">
                    {platform}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditional fields based on meeting platform */}
          {(meetingPlatform === 'WhatsApp' || meetingPlatform === 'Phone Call') && (
            <div>
              <Label htmlFor="phone-number" className="text-sm sm:text-base font-medium mb-1 sm:mb-2 block">
                Your Phone Number {meetingPlatform === 'WhatsApp' ? '(for WhatsApp)' : '(for Phone Call)'}
              </Label>
              <Input
                id="phone-number"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          {meetingPlatform === 'Telegram' && (
            <div>
              <Label htmlFor="telegram-username" className="text-sm sm:text-base font-medium mb-1 sm:mb-2 block">
                Your Telegram Username
              </Label>
              <Input
                id="telegram-username"
                placeholder="Enter your Telegram username"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
                className="text-sm"
              />
            </div>
          )}

          {/* Notes field */}
          <div>
            <Label htmlFor="session-notes" className="text-sm sm:text-base font-medium mb-1 sm:mb-2 block">
              Session Notes (Optional)
            </Label>
            <Textarea
              id="session-notes"
              placeholder="Add any specific topics or questions you'd like to discuss..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[80px] sm:min-h-[100px] text-sm"
            />
          </div>
        </>
      )}
    </div>
  );
}
