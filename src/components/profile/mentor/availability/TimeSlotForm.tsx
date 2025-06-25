
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ExistingTimeSlots } from './ExistingTimeSlots';

interface TimeSlotFormData {
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
}

interface TimeSlotFormProps {
  profileId: string;
  onSuccess: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
  { value: 0, label: 'Sunday' }
];

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time' },
  { value: 'America/Chicago', label: 'Central Time' },
  { value: 'America/Denver', label: 'Mountain Time' },
  { value: 'America/Los_Angeles', label: 'Pacific Time' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Shanghai', label: 'Shanghai' },
  { value: 'Australia/Sydney', label: 'Sydney' }
];

export function TimeSlotForm({ profileId, onSuccess }: TimeSlotFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TimeSlotFormData>({
    defaultValues: {
      day_of_week: 1,
      start_time: '',
      end_time: '',
      timezone: 'UTC'
    }
  });

  const onSubmit = async (data: TimeSlotFormData) => {
    setIsSubmitting(true);
    try {
      // Create datetime strings for the database
      const today = new Date();
      const startDateTime = new Date(today);
      const endDateTime = new Date(today);
      
      const [startHour, startMinute] = data.start_time.split(':').map(Number);
      const [endHour, endMinute] = data.end_time.split(':').map(Number);
      
      startDateTime.setHours(startHour, startMinute, 0, 0);
      endDateTime.setHours(endHour, endMinute, 0, 0);

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          day_of_week: data.day_of_week,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          timezone: data.timezone,
          is_recurring: true,
          is_available: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot added successfully",
      });

      reset();
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add time slot",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="day_of_week">Day of Week</Label>
          <Select onValueChange={(value) => setValue('day_of_week', parseInt(value))}>
            <SelectTrigger>
              <SelectValue placeholder="Select day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map((day) => (
                <SelectItem key={day.value} value={day.value.toString()}>
                  {day.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.day_of_week && (
            <p className="text-sm text-red-500">Day of week is required</p>
          )}
        </div>

        <div>
          <Label htmlFor="start_time">Start Time</Label>
          <Input
            id="start_time"
            type="time"
            {...register("start_time", { required: "Start time is required" })}
          />
          {errors.start_time && (
            <p className="text-sm text-red-500">{errors.start_time.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="end_time">End Time</Label>
          <Input
            id="end_time"
            type="time"
            {...register("end_time", { required: "End time is required" })}
          />
          {errors.end_time && (
            <p className="text-sm text-red-500">{errors.end_time.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Select onValueChange={(value) => setValue('timezone', value)} defaultValue="UTC">
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Time Slot"}
        </Button>
      </form>

      <ExistingTimeSlots profile_id={profileId} onUpdate={onSuccess} />
    </div>
  );
}
