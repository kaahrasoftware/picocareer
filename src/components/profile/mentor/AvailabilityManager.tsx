import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotForm } from "./availability/TimeSlotForm";
import { UnavailableTimeForm } from "./availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "./availability/ExistingTimeSlots";
import { useUserSettings } from "@/hooks/useUserSettings";

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

  useEffect(() => {
    if (!selectedDate) return;
    fetchAvailability();
  }, [selectedDate, profileId]);

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