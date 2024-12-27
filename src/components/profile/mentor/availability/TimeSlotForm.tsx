import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TimeSlotPicker } from "./TimeSlotPicker";

interface TimeSlotFormProps {
  selectedDate: Date | undefined;
  profileId: string;
  onSuccess: () => void;
}

export function TimeSlotForm({ selectedDate, profileId, onSuccess }: TimeSlotFormProps) {
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

      // First, check if there's any overlapping availability for this date and time
      const { data: existingSlots } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date_available', formattedDate)
        .or(`start_time.lte.${selectedEndTime},end_time.gte.${selectedStartTime}`);

      if (existingSlots && existingSlots.length > 0) {
        toast({
          title: "Time slot conflict",
          description: "You already have availability set that overlaps with this time slot",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // If no conflicts, proceed with insertion
      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: formattedDate,
          start_time: selectedStartTime,
          end_time: selectedEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_available: true
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Duplicate time slot",
            description: "This time slot is already set for this date",
            variant: "destructive",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Success",
          description: "Availability has been set",
        });
        
        setSelectedStartTime(undefined);
        setSelectedEndTime(undefined);
        onSuccess();
      }
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

  return (
    <div className="space-y-4">
      <TimeSlotPicker
        selectedStartTime={selectedStartTime}
        selectedEndTime={selectedEndTime}
        onStartTimeSelect={setSelectedStartTime}
        onEndTimeSelect={setSelectedEndTime}
        onSave={handleSaveAvailability}
        mentorId={profileId}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}