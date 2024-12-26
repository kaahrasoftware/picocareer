import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = React.useState<string>();
  const { toast } = useToast();

  const timeSlots = [
    { time: "09:00", available: true },
    { time: "10:00", available: true },
    { time: "11:00", available: true },
    { time: "12:00", available: true },
    { time: "13:00", available: true },
    { time: "14:00", available: true },
    { time: "15:00", available: true },
    { time: "16:00", available: true },
    { time: "17:00", available: true }
  ];

  const handleSaveAvailability = async () => {
    if (!selectedDate || !selectedTime) return;

    try {
      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: selectedDate.toISOString().split('T')[0],
          start_time: selectedTime,
          end_time: `${parseInt(selectedTime.split(':')[0]) + 1}:00`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Availability has been set",
      });
      
      onUpdate();
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to set availability",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Availability</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
            />
          </div>
          <div>
            {selectedDate && (
              <TimeSlotSelector
                date={selectedDate}
                availableTimeSlots={timeSlots}
                selectedTime={selectedTime}
                onTimeSelect={setSelectedTime}
                selectedSessionType={undefined}
              />
            )}
          </div>
        </div>
        <Button 
          onClick={handleSaveAvailability}
          disabled={!selectedDate || !selectedTime}
          className="w-full"
        >
          Save Availability
        </Button>
      </CardContent>
    </Card>
  );
}