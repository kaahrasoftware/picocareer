
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, isBefore } from "date-fns";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { useAvailableDates } from "@/hooks/useAvailableDates";
import { useAvailableTimeSlots } from "@/hooks/useAvailableTimeSlots";
import { useMentorTimezone } from "@/hooks/useMentorTimezone";
import { TimeSlotsGrid } from "@/components/booking/TimeSlotsGrid";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentScheduledTime: Date;
  duration: number;
  mentorId?: string;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  sessionId,
  currentScheduledTime,
  duration,
  mentorId
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentScheduledTime);
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const { rescheduleSession, isLoading } = useSessionManagement();
  const { toast } = useToast();

  // Get mentor's available dates
  const availableDates = useAvailableDates(mentorId || '');
  
  // Get mentor's timezone
  const { data: mentorTimezone, isLoading: isLoadingTimezone } = useMentorTimezone(mentorId);
  
  // Get available time slots for selected date
  const { 
    timeSlots: availableTimeSlots, 
    isLoading: isLoadingTimeSlots,
    error: timeSlotsError
  } = useAvailableTimeSlots(
    selectedDate, 
    mentorId || '', 
    duration,
    mentorTimezone || 'UTC'
  );

  const handleReschedule = async () => {
    if (!selectedTime || !selectedDate) {
      toast({
        title: "Missing information",
        description: "Please select both a date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(hours, minutes, 0, 0);

      if (isBefore(newDateTime, new Date())) {
        toast({
          title: "Invalid time",
          description: "Please select a future date and time.",
          variant: "destructive",
        });
        return;
      }

      await rescheduleSession.mutateAsync({
        sessionId,
        newTime: newDateTime.toISOString(),
      });

      onClose();
    } catch (error) {
      console.error("Error rescheduling session:", error);
    }
  };

  // Filter available dates to only show dates that have availability
  const isDateAvailable = (date: Date) => {
    if (isBefore(date, addDays(new Date(), 1))) return false;
    return availableDates.some(availableDate => {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      const availableDateOnly = new Date(availableDate);
      availableDateOnly.setHours(0, 0, 0, 0);
      return dateOnly.getTime() === availableDateOnly.getTime();
    });
  };

  const hasAvailableSlots = availableTimeSlots && availableTimeSlots.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Choose a new date and time from your mentor's available schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session Info */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Session duration: {duration} minutes
            </span>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Select Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setSelectedTime(undefined); // Reset time selection when date changes
                }
              }}
              disabled={(date) => !isDateAvailable(date)}
              initialFocus
              className="rounded-md border"
            />
          </div>

          {/* Time Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Available Time Slots
            </label>
            
            {isLoadingTimeSlots || isLoadingTimezone ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm text-muted-foreground">Loading available times...</span>
              </div>
            ) : timeSlotsError ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Error loading available times. Please try again.
                </AlertDescription>
              </Alert>
            ) : !hasAvailableSlots ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No available time slots for this date. Please select a different date.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <TimeSlotsGrid
                  title=""
                  timeSlots={availableTimeSlots}
                  selectedTime={selectedTime}
                  onTimeSelect={setSelectedTime}
                  mentorTimezone={mentorTimezone || 'UTC'}
                  date={selectedDate}
                  isLoading={false}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Times shown in mentor's timezone ({mentorTimezone || 'UTC'})
                </p>
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={isLoading || !selectedTime || !hasAvailableSlots}
          >
            {isLoading ? "Rescheduling..." : "Reschedule Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
