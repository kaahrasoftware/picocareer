import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TimeSlotPicker } from "./availability/TimeSlotPicker";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { SessionTypeManager } from "./SessionTypeManager";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const { toast } = useToast();

  // Generate time slots for the full day
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    available: true
  }));

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
    fetchSessionTypes();
  }, [selectedDate, profileId]);

  const fetchAvailability = async () => {
    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('date_available', format(selectedDate!, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error fetching availability:', error);
      return;
    }

    setExistingSlots(data || []);
  };

  const fetchSessionTypes = async () => {
    const { data, error } = await supabase
      .from('mentor_session_types')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching session types:', error);
      return;
    }

    setSessionTypes(data || []);
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
      onUpdate();
      fetchAvailability();
    } catch (error) {
      console.error('Error setting availability:', error);
      toast({
        title: "Error",
        description: "Failed to set availability",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot removed",
      });
      
      setExistingSlots(existingSlots.filter(slot => slot.id !== slotId));
      onUpdate();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        title: "Error",
        description: "Failed to remove time slot",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Select Date</h4>
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
            
            {selectedDate && (
              <TimeSlotPicker
                selectedStartTime={selectedStartTime}
                selectedEndTime={selectedEndTime}
                onStartTimeSelect={setSelectedStartTime}
                onEndTimeSelect={setSelectedEndTime}
                onSave={handleSaveAvailability}
                timeSlots={timeSlots}
              />
            )}
          </div>

          <ExistingTimeSlots 
            slots={existingSlots}
            onDelete={handleDeleteSlot}
          />
        </CardContent>
      </Card>

      <SessionTypeManager
        profileId={profileId}
        sessionTypes={sessionTypes}
        onUpdate={() => {
          fetchSessionTypes();
          onUpdate();
        }}
      />
    </div>
  );
}