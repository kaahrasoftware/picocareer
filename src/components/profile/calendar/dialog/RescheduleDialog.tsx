import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format, set, isBefore, addMinutes } from "date-fns";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { TimeSlotSelector } from "../../mentor/availability/TimeSlotSelector";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { Alert, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentScheduledTime: Date;
  duration: number;
  mentorId: string;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  sessionId,
  currentScheduledTime,
  duration,
  mentorId,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentScheduledTime);
  const [selectedTime, setSelectedTime] = useState<string>(
    format(currentScheduledTime, "HH:mm")
  );
  const { toast } = useToast();
  const { rescheduleSession, isLoading } = useSessionManagement();
  const { data: mentorTimezone } = useMentorTimezone(mentorId);
  
  const { 
    timeSlots: availableTimeSlots, 
    isLoading: isLoadingTimeSlots,
    rawData 
  } = useAvailableTimeSlots(
    selectedDate, 
    mentorId, 
    duration,
    mentorTimezone || 'UTC'
  );

  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      if (!mentorId) return;
      
      setIsLoadingDates(true);
      try {
        // Get the next 60 days to check
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 60; i++) {
          const date = new Date();
          date.setDate(today.getDate() + i);
          dates.push(date);
        }
        
        // Filter dates that have availability
        const availableDatesArray = [];
        
        for (const date of dates) {
          // Check if this date has any availability
          const { data: availabilityData } = await supabase
            .from('mentor_availability')
            .select('*')
            .eq('profile_id', mentorId)
            .eq('is_available', true)
            .is('booked_session_id', null)
            .or(`and(start_date_time::date = '${format(date, 'yyyy-MM-dd')}'),and(recurring = true,day_of_week = ${date.getDay()})`)
            .limit(1);
            
          if (availabilityData && availabilityData.length > 0) {
            availableDatesArray.push(date);
          }
        }
        
        setAvailableDates(availableDatesArray);
      } catch (error) {
        console.error('Error fetching available dates:', error);
        toast({
          title: "Error",
          description: "Failed to load available dates",
          variant: "destructive",
        });
      } finally {
        setIsLoadingDates(false);
      }
    };

    fetchAvailableDates();
  }, [mentorId, toast]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset time when date changes
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleReschedule = async () => {
    if (!selectedTime) {
      toast({
        title: "No time selected",
        description: "Please select an available time slot",
        variant: "destructive"
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const newDateTime = set(selectedDate, {
      hours,
      minutes,
      seconds: 0,
      milliseconds: 0,
    });

    // Check if the selected date/time is in the past
    if (isBefore(newDateTime, new Date())) {
      toast({
        title: "Invalid time",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    // Check if the new time is the same as current time
    if (
      format(newDateTime, "yyyy-MM-dd'T'HH:mm:ss") ===
      format(currentScheduledTime, "yyyy-MM-dd'T'HH:mm:ss")
    ) {
      toast({
        title: "No changes made",
        description: "The selected time is the same as the current scheduled time.",
      });
      onClose();
      return;
    }

    try {
      await rescheduleSession.mutateAsync({
        sessionId,
        newTime: newDateTime.toISOString(),
      });
      onClose();
    } catch (error) {
      console.error("Failed to reschedule session:", error);
    }
  };

  // isDateAvailable check
  const isDateAvailable = (date: Date) => {
    return availableDates.some(
      availableDate => format(availableDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Current time: {format(currentScheduledTime, "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Select a new date</Label>
            {isLoadingDates ? (
              <div className="flex items-center justify-center h-[350px] border rounded-md">
                <div className="text-center">
                  <span className="loading loading-spinner"></span>
                  <p className="mt-2">Loading available dates...</p>
                </div>
              </div>
            ) : (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={(date) => 
                  isBefore(date, new Date()) || 
                  !isDateAvailable(date)
                }
                className="border rounded-md p-3"
              />
            )}
            {availableDates.length === 0 && !isLoadingDates && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No available dates</AlertTitle>
                <AlertDescription>
                  There are no dates available for rescheduling. Please contact the mentor to add more availability.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {selectedDate && (
            <div className="space-y-2">
              <Label htmlFor="time">Select a new time</Label>
              {availableTimeSlots.length > 0 ? (
                <TimeSlotSelector
                  selectedTime={selectedTime}
                  onTimeChange={handleTimeChange}
                  interval={15}
                  showTimeSlots={true}
                  duration={duration}
                  timeSlots={availableTimeSlots}
                  isLoading={isLoadingTimeSlots}
                />
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No available times</AlertTitle>
                  <AlertDescription>
                    There are no available time slots for the selected date. Please select a different date.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleReschedule} disabled={isLoading || !selectedTime}>
            {isLoading ? "Rescheduling..." : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
