
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TimeSlotForm } from "../calendar/availability/TimeSlotForm";
import { UnavailableTimeForm } from "../calendar/availability/UnavailableTimeForm";
import { ExistingTimeSlots } from "../calendar/availability/ExistingTimeSlots";
import { format } from "date-fns";
import { Availability } from "@/types/calendar";
import { CalendarContainer } from "../calendar/CalendarContainer";
import { MultiDayAvailabilityForm } from "../calendar/availability/MultiDayAvailabilityForm";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AvailabilityManagerProps {
  profileId: string;
  onUpdate: () => void;
}

export function AvailabilityManager({ profileId, onUpdate }: AvailabilityManagerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>();
  const [existingSlots, setExistingSlots] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("available");
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [selectionMode, setSelectionMode] = useState<"single" | "range">("single");

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

    const availabilityData = data || [];
    setAvailability(availabilityData);
  };

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from('mentor_availability')
        .delete()
        .eq('id', slotId);

      if (error) throw error;

      setExistingSlots(existingSlots.filter(slot => slot.id !== slotId));
      fetchAllAvailability();
      onUpdate();
    } catch (error) {
      console.error('Error deleting slot:', error);
    }
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setSelectedDateRange(range);
    if (range?.from) {
      setSelectedDate(range.from);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-foreground/90">Manage Availability</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Calendar section - wider to accommodate two months */}
        <div className="md:col-span-7 bg-background rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Calendar</h3>
          <CalendarContainer
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            availability={availability}
            selectedDateRange={selectedDateRange}
            setSelectedDateRange={handleDateRangeChange}
            selectionMode={selectionMode}
          />
        </div>
        
        {/* Time slot form section */}
        <div className="md:col-span-5 bg-background rounded-lg border shadow-sm p-6">
          {selectedDate && (
            <>
              <h3 className="text-lg font-medium mb-4">
                {selectionMode === "single" 
                  ? `Availability for ${format(selectedDate, 'MMMM d, yyyy')}` 
                  : "Set Availability for Multiple Days"}
              </h3>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
                <TabsList className="w-full mb-4 grid grid-cols-2">
                  <TabsTrigger value="available">Available Times</TabsTrigger>
                  <TabsTrigger value="unavailable">Unavailable Times</TabsTrigger>
                </TabsList>
                
                <TabsContent value="available" className="pt-2">
                  {selectionMode === "single" ? (
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
                  ) : (
                    <MultiDayAvailabilityForm
                      selectedDate={selectedDate}
                      selectedDateRange={selectedDateRange}
                      profileId={profileId}
                      onSuccess={() => {
                        fetchAvailability();
                        fetchAllAvailability();
                        onUpdate();
                      }}
                      onDateRangeChange={handleDateRangeChange}
                    />
                  )}
                </TabsContent>
                
                <TabsContent value="unavailable" className="pt-2">
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
            </>
          )}
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm p-6">
        <h3 className="text-lg font-medium mb-4">Your Availability Slots</h3>
        <ExistingTimeSlots 
          slots={existingSlots}
          onDelete={handleDeleteSlot}
        />
      </div>
    </div>
  );
}
