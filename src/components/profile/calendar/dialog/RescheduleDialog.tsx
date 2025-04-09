
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format, addDays, addHours, setHours, setMinutes, startOfDay, addMinutes, isBefore } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";

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
  const [selectedTime, setSelectedTime] = useState<string>(format(currentScheduledTime, "HH:mm"));
  const { rescheduleSession, isLoading } = useSessionManagement();
  const { toast } = useToast();

  // Calculate available time slots based on duration
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = startOfDay(new Date());
    startTime.setHours(9, 0, 0, 0); // Start at 9 AM
    const endTime = startOfDay(new Date());
    endTime.setHours(20, 0, 0, 0); // End at 8 PM

    let current = startTime;
    while (isBefore(current, endTime)) {
      slots.push(format(current, "HH:mm"));
      current = addMinutes(current, 30); // 30-minute intervals
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleReschedule = async () => {
    try {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const newDateTime = setHours(setMinutes(selectedDate, minutes), hours);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
          <DialogDescription>
            Choose a new date and time for your session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="date" className="block text-sm font-medium">
              Date
            </label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => isBefore(date, new Date()) || date < addDays(new Date(), 1)}
              initialFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="time" className="block text-sm font-medium">
              Time
            </label>
            <Select defaultValue={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            Session duration: {duration} minutes
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleReschedule} disabled={isLoading}>
            {isLoading ? "Rescheduling..." : "Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
