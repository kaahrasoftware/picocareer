import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { useUserSettings } from "@/hooks/useUserSettings";
import { format } from "date-fns";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("available");
  const { getSetting } = useUserSettings(profileId);
  const userTimezone = getSetting('timezone');
  const [availableDates, setAvailableDates] = useState<Date[]>([]);

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
  }, [selectedDate, profileId]);

  useEffect(() => {
    fetchAllAvailability();
  }, [profileId]);

  const fetchAllAvailability = async () => {
    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching availability:', error);
      return;
    }

    const dates = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Add next 90 days for recurring slots
    const recurringSlots = data.filter(slot => slot.recurring);
    for (let i = 0; i < 90; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      
      recurringSlots.forEach(slot => {
        if (slot.day_of_week === date.getDay()) {
          dates.add(format(date, 'yyyy-MM-dd'));
        }
      });
    }

    // Add specific dates
    data
      .filter(slot => !slot.recurring && slot.start_date_time)
      .forEach(slot => {
        const date = new Date(slot.start_date_time);
        if (date >= today) {
          dates.add(format(date, 'yyyy-MM-dd'));
        }
      });

    setAvailableDates(Array.from(dates).map(dateStr => new Date(dateStr)));
  };

  const fetchAvailability = async () => {
    const startOfDay = new Date(selectedDate!);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(selectedDate!);
    endOfDay.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .gte('start_date_time', startOfDay.toISOString())
      .lte('start_date_time', endOfDay.toISOString());

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
      fetchAllAvailability(); // Refresh available dates
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
              modifiers={{
                available: availableDates
              }}
              modifiersStyles={{
                available: {
                  border: '2px solid #22c55e',
                  borderRadius: '4px'
                }
              }}
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