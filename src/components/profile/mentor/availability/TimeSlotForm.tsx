import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface TimeSlotFormProps {
  selectedDate: Date | undefined;
  profileId: string;
  onSuccess: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userTimezone, setUserTimezone] = useState<string>('UTC');
  const { toast } = useToast();

  // Fetch user's timezone from settings
  useEffect(() => {
    const fetchUserTimezone = async () => {
      const { data: settings } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', profileId)
        .eq('setting_type', 'timezone')
        .single();
      
      if (settings?.setting_value) {
        setUserTimezone(settings.setting_value);
      }
    };

    fetchUserTimezone();
  }, [profileId]);

  const checkForOverlap = async (formattedDate: string, startTime: string, endTime: string) => {
    const { data: existingSlots } = await supabase
      .from('mentor_availability')
      .select('start_time, end_time')
      .eq('profile_id', profileId)
      .eq('date_available', formattedDate)
      .eq('is_available', true);

    if (!existingSlots) return false;

    // Convert times to comparable format (minutes since midnight)
    const newStart = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const newEnd = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);

    return existingSlots.some(slot => {
      const slotStart = parseInt(slot.start_time.split(':')[0]) * 60 + parseInt(slot.start_time.split(':')[1]);
      const slotEnd = parseInt(slot.end_time.split(':')[0]) * 60 + parseInt(slot.end_time.split(':')[1]);

      return (newStart < slotEnd && newEnd > slotStart);
    });
  };

  const handleSaveAvailability = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      toast({
        title: "Missing information",
        description: "Please select both start and end times",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Check for overlapping slots
      const hasOverlap = await checkForOverlap(formattedDate, selectedStartTime, selectedEndTime);

      if (hasOverlap) {
        toast({
          title: "Time slot conflict",
          description: "This time slot overlaps with an existing availability slot. Please choose a different time.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Get the correct day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const dayOfWeek = selectedDate.getDay();

      // Insert new availability slot
      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: formattedDate,
          start_time: selectedStartTime,
          end_time: selectedEndTime,
          timezone: userTimezone, // Use the user's timezone from settings
          is_available: true,
          recurring: isRecurring,
          day_of_week: isRecurring ? dayOfWeek : null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: isRecurring 
          ? `Weekly availability has been set for every ${format(selectedDate, 'EEEE')}`
          : "Availability has been set",
      });
      
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
      setIsRecurring(false);
      onSuccess();
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to set availability",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots for the full day in 30-minute increments
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium mb-2">Start Time</h4>
        <select
          value={selectedStartTime}
          onChange={(e) => setSelectedStartTime(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select start time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedEndTime ? time >= selectedEndTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h4 className="font-medium mb-2">End Time</h4>
        <select
          value={selectedEndTime}
          onChange={(e) => setSelectedEndTime(e.target.value)}
          className="w-full border border-input bg-background px-3 py-2 rounded-md"
        >
          <option value="">Select end time</option>
          {timeSlots.map((time) => (
            <option 
              key={time} 
              value={time}
              disabled={selectedStartTime ? time <= selectedStartTime : false}
            >
              {time}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="recurring"
          checked={isRecurring}
          onCheckedChange={setIsRecurring}
        />
        <Label htmlFor="recurring">Make this a weekly recurring availability</Label>
      </div>

      <p className="text-sm text-muted-foreground">
        Times shown in your timezone ({userTimezone})
      </p>

      <Button 
        onClick={handleSaveAvailability}
        disabled={!selectedStartTime || !selectedEndTime || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? "Saving..." : "Save Availability"}
      </Button>
    </div>
  );
}