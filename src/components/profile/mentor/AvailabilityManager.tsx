import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { TimeSlotSelector } from "@/components/booking/TimeSlotSelector";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStartTime, setSelectedStartTime] = useState<string>();
  const [selectedEndTime, setSelectedEndTime] = useState<string>();
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const { toast } = useToast();

  // Generate time slots for the full day
  const timeSlots = Array.from({ length: 24 }, (_, i) => ({
    time: `${String(i).padStart(2, '0')}:00`,
    available: true
  }));

  // Fetch existing availability slots when date changes
  React.useEffect(() => {
    async function fetchAvailability() {
      if (!selectedDate) return;

      const { data, error } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date_available', format(selectedDate, 'yyyy-MM-dd'));

      if (error) {
        console.error('Error fetching availability:', error);
        return;
      }

      setExistingSlots(data || []);
    }

    fetchAvailability();
  }, [selectedDate, profileId]);

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
      
      // Refresh the existing slots
      const { data: newData } = await supabase
        .from('mentor_availability')
        .select('*')
        .eq('profile_id', profileId)
        .eq('date_available', format(selectedDate, 'yyyy-MM-dd'));
        
      setExistingSlots(newData || []);
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
              <>
                <h4 className="font-medium mb-2">Set Available Hours</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <TimeSlotSelector
                      date={selectedDate}
                      availableTimeSlots={timeSlots}
                      selectedTime={selectedStartTime}
                      onTimeSelect={setSelectedStartTime}
                      selectedSessionType={undefined}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <TimeSlotSelector
                      date={selectedDate}
                      availableTimeSlots={timeSlots.filter(slot => 
                        !selectedStartTime || slot.time > selectedStartTime
                      )}
                      selectedTime={selectedEndTime}
                      onTimeSelect={setSelectedEndTime}
                      selectedSessionType={undefined}
                    />
                  </div>
                  <Button 
                    onClick={handleSaveAvailability}
                    disabled={!selectedStartTime || !selectedEndTime}
                    className="w-full"
                  >
                    Save Availability
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {existingSlots.length > 0 && (
          <div className="mt-6">
            <h4 className="font-medium mb-2">Existing Time Slots</h4>
            <div className="space-y-2">
              {existingSlots.map((slot) => (
                <div 
                  key={slot.id}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <span>
                    {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')} - 
                    {format(new Date(`2000-01-01T${slot.end_time}`), 'h:mm a')}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}