
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";

export function MentorAvailabilityForm() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const mentorId = profile?.id || '';

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Set Availability</CardTitle>
          <CardDescription>Select a date to view and manage your available time slots.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <label htmlFor="date" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed">
              Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date()
              }
              className={cn("w-full rounded-md border")}
            />
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <div>
          <label className="block text-sm font-medium mb-2">Available Times</label>
          <TimeSlotSelector
            selectedDate={selectedDate}
            mentorId={mentorId}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
          />
        </div>
      )}
    </div>
  );
}
