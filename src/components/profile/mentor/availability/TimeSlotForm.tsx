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

      // Check if the new slot overlaps with any existing slot
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
          description: "This time slot overlaps with an existing availability slot",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // First try to update any existing slot for this date that might be marked as unavailable
      const { data: existingSlot } = await supabase
        .from('mentor_availability')
        .select('id')
        .eq('profile_id', profileId)
        .eq('date_available', formattedDate)
        .eq('is_available', false)
        .single();

      if (existingSlot) {
        // Update existing slot
        const { error } = await supabase
          .from('mentor_availability')
          .update({
            start_time: selectedStartTime,
            end_time: selectedEndTime,
            is_available: true
          })
          .eq('id', existingSlot.id);

        if (error) throw error;
      } else {
        // Insert new slot
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

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Availability has been set",
      });
      
      setSelectedStartTime(undefined);
      setSelectedEndTime(undefined);
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