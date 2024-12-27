import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [existingSlots, setExistingSlots] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
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

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      setExistingSlots(existingSlots.filter(slot => slot.id !== slotId));
      onUpdate();
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  return (
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
            <TimeSlotForm
              selectedDate={selectedDate}
              profileId={profileId}
              onSuccess={() => {
                fetchAvailability();
                onUpdate();
              }}
            />
          )}
        </div>

        <ExistingTimeSlots 
          slots={existingSlots}
          onDelete={handleDeleteSlot}
        />
      </CardContent>
    </Card>
  );
}