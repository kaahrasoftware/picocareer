
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { format, set, isBefore, addMinutes } from "date-fns";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";
import { TimeSlotSelector } from "../../mentor/availability/TimeSlotSelector";

interface RescheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentScheduledTime: Date;
  duration: number;
}

export function RescheduleDialog({
  isOpen,
  onClose,
  sessionId,
  currentScheduledTime,
  duration,
}: RescheduleDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(currentScheduledTime);
  const [selectedTime, setSelectedTime] = useState<string>(
    format(currentScheduledTime, "HH:mm")
  );
  const { toast } = useToast();
  const { rescheduleSession, isLoading } = useSessionManagement();

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleTimeChange = (time: string) => {
    setSelectedTime(time);
  };

  const handleReschedule = async () => {
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
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateChange}
              disabled={(date) => isBefore(date, new Date())}
              className="border rounded-md p-3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Select a new time</Label>
            <TimeSlotSelector
              selectedTime={selectedTime}
              onTimeChange={handleTimeChange}
              interval={15}
              showTimeSlots={true}
              duration={duration}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleReschedule} disabled={isLoading}>
            {isLoading ? "Rescheduling..." : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
