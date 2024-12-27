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

    try {
      // Check for existing slot
      const { data: existingSlot } = await supabase
        .from('mentor_availability')
        .select('id')
        .eq('profile_id', profileId)
        .eq('date_available', format(selectedDate, 'yyyy-MM-dd'))
        .eq('start_time', selectedStartTime)
        .maybeSingle();

      if (existingSlot) {
        toast({
          title: "Time slot exists",
          description: "This time slot is already set for this date",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('mentor_availability')
        .insert({
          profile_id: profileId,
          date_available: format(selectedDate, 'yyyy-MM-dd'),
          start_time: selectedStartTime,
          end_time: selectedEndTime,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          is_available: true
        });

      if (error) throw error;

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
      />
    </div>
  );
}