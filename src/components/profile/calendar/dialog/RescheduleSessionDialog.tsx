
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { useSessionManagement } from "@/hooks/useSessionManagement";
import { useToast } from "@/hooks/use-toast";

interface RescheduleSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  currentScheduledTime: Date;
  duration: number;
  onSuccess?: () => void;
}

export function RescheduleSessionDialog({
  isOpen,
  onClose,
  sessionId,
  currentScheduledTime,
  duration,
  onSuccess
}: RescheduleSessionDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const { rescheduleSession, isLoading } = useSessionManagement();
  const { toast } = useToast();

  // Generate available time slots
  const timeSlots = [];
  for (let hour = 8; hour < 20; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const formattedHour = hour.toString().padStart(2, "0");
      const formattedMinute = minute.toString().padStart(2, "0");
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast({
        title: "Error",
        description: "Please select both a date and time.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = selectedTime.split(":").map(Number);
    const newDateTime = new Date(selectedDate);
    newDateTime.setHours(hours, minutes, 0, 0);

    try {
      await rescheduleSession.mutateAsync({
        sessionId: sessionId,
        newTime: newDateTime.toISOString(),
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error handling is done in the useSessionManagement hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Reschedule Session</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="text-sm">
            <p className="font-medium">Current Session Time</p>
            <p className="text-muted-foreground">
              {format(currentScheduledTime, "MMMM d, yyyy 'at' h:mm a")}
            </p>
            <p className="text-muted-foreground mt-1">Duration: {duration} minutes</p>
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-sm">Select New Date</p>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date() || date > addDays(new Date(), 60)}
              initialFocus
            />
          </div>
          
          <div className="space-y-2">
            <p className="font-medium text-sm">Select New Time</p>
            <div className="grid grid-cols-4 gap-2">
              {timeSlots.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(time)}
                  className="text-xs"
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule} 
              disabled={isLoading || !selectedDate || !selectedTime}
            >
              {isLoading ? "Rescheduling..." : "Reschedule Session"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
