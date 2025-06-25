
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TimeSlotInputs } from './TimeSlotInputs';
import { ExistingTimeSlots } from './ExistingTimeSlots';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format, addDays } from 'date-fns';

interface TimeSlotFormProps {
  profileId: string;
  onSuccess?: () => void;
}

export function TimeSlotForm({ profileId, onSuccess }: TimeSlotFormProps) {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState('');
  const [selectedEndTime, setSelectedEndTime] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTimezone, setUserTimezone] = useState('');

  // Generate time slots from 8 AM to 10 PM
  const timeSlots = Array.from({ length: 56 }, (_, i) => {
    const hour = Math.floor(i / 4) + 8;
    const minute = (i % 4) * 15;
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  });

  useEffect(() => {
    setUserTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const handleSubmit = async () => {
    if (!selectedStartTime || !selectedEndTime) {
      toast({
        title: "Error",
        description: "Please select both start and end times",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const datesToAdd = isRecurring 
        ? Array.from({ length: 4 }, (_, i) => addDays(selectedDate, i * 7))
        : [selectedDate];

      for (const date of datesToAdd) {
        const startDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${selectedStartTime}:00`);
        const endDateTime = new Date(`${format(date, 'yyyy-MM-dd')}T${selectedEndTime}:00`);

        // Calculate timezone offset
        const timezoneOffset = -startDateTime.getTimezoneOffset();

        const { error } = await supabase
          .from('mentor_availability')
          .insert({
            profile_id: profileId,
            start_date_time: startDateTime.toISOString(),
            end_date_time: endDateTime.toISOString(),
            is_available: true,
            reference_timezone: userTimezone,
            timezone_offset: timezoneOffset,
            dst_aware: true,
            recurring: isRecurring,
            day_of_week: isRecurring ? date.getDay() : null
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Time slot${datesToAdd.length > 1 ? 's' : ''} added successfully`,
      });

      // Reset form
      setSelectedStartTime('');
      setSelectedEndTime('');
      setIsRecurring(false);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add time slots",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </div>

          <TimeSlotInputs
            timeSlots={timeSlots}
            selectedStartTime={selectedStartTime}
            selectedEndTime={selectedEndTime}
            isRecurring={isRecurring}
            userTimezone={userTimezone}
            onStartTimeSelect={setSelectedStartTime}
            onEndTimeSelect={setSelectedEndTime}
            onRecurringChange={() => setIsRecurring(!isRecurring)}
          />

          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedStartTime || !selectedEndTime}
            className="w-full"
          >
            {isSubmitting ? 'Adding...' : `Add Time Slot${isRecurring ? 's (4 weeks)' : ''}`}
          </Button>
        </CardContent>
      </Card>

      <ExistingTimeSlots profile_id={profileId} />
    </div>
  );
}
