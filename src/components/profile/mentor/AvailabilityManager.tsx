import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotForm } from "../calendar/availability/TimeSlotForm";
import { UnavailableTimeForm } from "../calendar/availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "../calendar/availability/ExistingTimeSlots";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";

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

  const fetchAllAvailability = async () => {
    const { data, error } = await supabase
      .from('mentor_availability')
      .select('*')
      .eq('profile_id', profileId)
      .eq('is_available', true);

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

  // Function to determine if a date has availability set
  const hasAvailability = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.some(slot => {
      if (slot.recurring) {
        return slot.day_of_week === date.getDay();
      }
      return format(new Date(slot.start_date_time), 'yyyy-MM-dd') === dateStr;
    });
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
                hasAvailability: (date) => hasAvailability(date)
              }}
              modifiersStyles={{
                hasAvailability: {
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