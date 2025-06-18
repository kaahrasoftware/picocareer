import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserSettings } from "@/hooks/useUserSettings";
import { supabase } from "@/integrations/supabase/client";

interface TimeOption {
  value: string;
  label: string;
}

const timeOptions: TimeOption[] = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  const time = `${hour.toString().padStart(2, '0')}:${minute}`;
  return { value: time, label: time };
});

export function UnavailableTimeForm() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [startTime, setStartTime] = useState(timeOptions[0].value);
  const [endTime, setEndTime] = useState(timeOptions[1].value);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { getSetting } = useUserSettings(profile?.id || '');
  const userTimezone = getSetting('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const startDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${startTime}:00`);
      const endDateTime = new Date(`${selectedDate.toISOString().split('T')[0]}T${endTime}:00`);

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profile?.id,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: false,
          reference_timezone: userTimezone || 'UTC',
          timezone_offset: startDateTime.getTimezoneOffset()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot marked as unavailable successfully!",
      });

      setSelectedDate(undefined);
      setStartTime(timeOptions[0].value);
      setEndTime(timeOptions[1].value);
    } catch (error) {
      console.error("Error creating unavailable time slot:", error);
      toast({
        title: "Error",
        description: "Failed to mark time slot as unavailable. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mark Unavailable Time</CardTitle>
        <CardDescription>Select a date and time range to mark as unavailable.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date">Date</Label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
            {selectedDate ? (
              <p className="text-sm text-muted-foreground mt-2">
                Selected date: {format(selectedDate, "PPP")}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mt-2">
                Please select a date.
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Select value={startTime} onValueChange={setStartTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Select value={endTime} onValueChange={setEndTime}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select end time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((time) => (
                    <SelectItem key={time.value} value={time.value}>
                      {time.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit">Mark as Unavailable</Button>
        </form>
      </CardContent>
    </Card>
  );
}
