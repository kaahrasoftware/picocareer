
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function UnavailableTimeForm() {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedStartTime, setSelectedStartTime] = useState<string>("");
  const [selectedEndTime, setSelectedEndTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const timeSlots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeString);
    }
  }

  const handleSubmit = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      toast({
        title: "Error",
        description: "Please select a date, start time, and end time",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        throw new Error("No authenticated user");
      }

      const startDateTime = new Date(selectedDate);
      const [startHour, startMinute] = selectedStartTime.split(':').map(Number);
      startDateTime.setHours(startHour, startMinute, 0, 0);

      const endDateTime = new Date(selectedDate);
      const [endHour, endMinute] = selectedEndTime.split(':').map(Number);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: session.user.id,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: false,
          timezone_offset: new Date().getTimezoneOffset()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Unavailable time slot added successfully",
      });

      // Reset form
      setSelectedDate(undefined);
      setSelectedStartTime("");
      setSelectedEndTime("");
    } catch (error) {
      console.error('Error adding unavailable time:', error);
      toast({
        title: "Error",
        description: "Failed to add unavailable time slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Block Unavailable Time</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Select Date</label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            disabled={(date) => date < new Date()}
          />
        </div>

        {selectedDate && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Start Time</label>
                <select
                  value={selectedStartTime}
                  onChange={(e) => setSelectedStartTime(e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 rounded-md"
                >
                  <option value="">Select start time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">End Time</label>
                <select
                  value={selectedEndTime}
                  onChange={(e) => setSelectedEndTime(e.target.value)}
                  className="w-full border border-input bg-background px-3 py-2 rounded-md"
                >
                  <option value="">Select end time</option>
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
              {isLoading ? "Adding..." : "Block Time Slot"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
