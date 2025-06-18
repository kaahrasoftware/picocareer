
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TimeSlotSelector } from "./TimeSlotSelector";
import { SessionTypeSelector } from "./SessionTypeSelector";

interface BookingFormProps {
  mentorId: string;
  onBookingComplete: () => void;
}

export function BookingForm({ mentorId, onBookingComplete }: BookingFormProps) {
  const [selectedSessionType, setSelectedSessionType] = useState<{
    id: string;
    type: string;
    duration: number;
    price: number;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");

  const handleSessionTypeSelect = (typeId: string) => {
    // Find the session type from the available options
    const sessionTypes = [
      { id: "consultation", type: "Consultation", duration: 30, price: 50 },
      { id: "coaching", type: "Coaching Session", duration: 60, price: 100 },
      { id: "review", type: "Portfolio Review", duration: 45, price: 75 }
    ];
    
    const selectedType = sessionTypes.find(type => type.id === typeId);
    if (selectedType) {
      setSelectedSessionType({
        id: selectedType.id,
        type: selectedType.type,
        duration: selectedType.duration,
        price: selectedType.price
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Session Type</label>
        <SessionTypeSelector
          onSessionTypeSelect={handleSessionTypeSelect}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center" side="bottom">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) =>
                date < new Date()
              }
              className="rounded-md border shadow-sm"
            />
          </PopoverContent>
        </Popover>
      </div>

      {selectedDate && selectedSessionType && (
        <div>
          <label className="block text-sm font-medium mb-2">Available Times</label>
          <TimeSlotSelector
            selectedDate={selectedDate}
            mentorId={mentorId}
            selectedTime={selectedTime}
            onTimeSelect={setSelectedTime}
            selectedSessionType={selectedSessionType}
          />
        </div>
      )}

      <div>
        <Button onClick={onBookingComplete}>Complete Booking</Button>
      </div>
    </div>
  );
}
