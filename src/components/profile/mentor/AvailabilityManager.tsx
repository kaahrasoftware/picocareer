import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotForm } from "../calendar/availability/TimeSlotForm";
import { UnavailableTimeForm } from "../calendar/availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "../calendar/availability/ExistingTimeSlots";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";
import { CalendarContainer } from "../calendar/CalendarContainer";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("available");
  const [availability, setAvailability] = useState<Availability[]>([]);

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
    fetchAllAvailability();
  }, [selectedDate, profileId]);

  const fetchAvailability = async () => {
    if (!selectedDate) return;
    
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    // First, get one-time slots for the selected date
    const { data: oneTimeSlots, error: oneTimeError } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('recurring', false)
      .gte('start_date_time', startOfDay.toISOString())
      .lte('start_date_time', endOfDay.toISOString());

    if (oneTimeError) {
      console.error('Error fetching one-time availability:', oneTimeError);
      return;
    }

    // Then, get recurring slots for this day of the week
    const { data: recurringSlots, error: recurringError } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('recurring', true)
      .eq('day_of_week', selectedDate.getDay());

    if (recurringError) {
      console.error('Error fetching recurring availability:', recurringError);
      return;
    }

    // Combine both types of slots
    const allSlots = [
      ...(oneTimeSlots || []),
      ...(recurringSlots || [])
    ];

    setExistingSlots(allSlots);
  };

  const fetchAllAvailability = async () => {
    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId);

    if (error) {
      console.error('Error fetching all availability:', error);
      return;
    }

    setAvailability(data || []);
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
            <CalendarContainer
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              availability={availability}
            />
          </div>
          
          {selectedDate && (
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="available">Available Times</TabsTrigger>
                  <TabsTrigger value="unavailable">Unavailable Times</TabsTrigger>
                </TabsList>
                <TabsContent value="available">
                  <TimeSlotForm
                    selectedDate={selectedDate}
                    profileId={profileId}
                    onSuccess={() => {
                      fetchAvailability();
                      fetchAllAvailability();
                      onUpdate();
                    }}
                    onShowUnavailable={() => setActiveTab("unavailable")}
                  />
                </TabsContent>
                <TabsContent value="unavailable">
                  <UnavailableTimeForm
                    selectedDate={selectedDate}
                    profileId={profileId}
                    onSuccess={() => {
                      fetchAvailability();
                      fetchAllAvailability();
                      onUpdate();
                    }}
                  />
                </TabsContent>
              </Tabs>
            </div>
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
