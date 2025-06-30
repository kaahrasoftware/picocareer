
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Plus } from 'lucide-react';

interface TimeSlotFormProps {
  profileId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function TimeSlotForm({ profileId, onSuccess, onCancel }: TimeSlotFormProps) {
  const [selectedDay, setSelectedDay] = useState<number | ''>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const daysOfWeek = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDay === '' || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create a proper datetime for the availability slot
      const today = new Date();
      const startDateTime = new Date(today);
      startDateTime.setHours(parseInt(startTime.split(':')[0]), parseInt(startTime.split(':')[1]), 0, 0);
      
      const endDateTime = new Date(today);
      endDateTime.setHours(parseInt(endTime.split(':')[0]), parseInt(endTime.split(':')[1]), 0, 0);

      // Calculate timezone offset
      const timezoneOffset = -(new Date().getTimezoneOffset());

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          day_of_week: selectedDay as number,
          start_date_time: startDateTime.toISOString(),
          end_date_time: endDateTime.toISOString(),
          is_available: true,
          reference_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          timezone_offset: timezoneOffset,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot added successfully.",
      });

      onSuccess();
    } catch (error: any) {
      console.error('Error adding time slot:', error);
      toast({
        title: "Error",
        description: "Failed to add time slot. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Add Availability Slot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="day">Day of Week</Label>
            <Select value={selectedDay.toString()} onValueChange={(value) => setSelectedDay(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Adding...' : 'Add Slot'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
