import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface TimeSlotSelectorProps {
  date: Date | undefined;
  availableTimeSlots: TimeSlot[];
  selectedTime: string | undefined;
  onTimeSelect: (time: string) => void;
}

export function TimeSlotSelector({ 
  date, 
  availableTimeSlots, 
  selectedTime, 
  onTimeSelect 
}: TimeSlotSelectorProps) {
  if (!date) return null;

  return (
    <div>
      <h4 className="font-semibold mb-2">
        Available Times for {format(date, "MMMM d, yyyy")}
      </h4>
      <ScrollArea className="h-[200px] rounded-md border border-kahra-darker">
        <div className="grid grid-cols-2 gap-2 p-4">
          {availableTimeSlots.length > 0 ? (
            availableTimeSlots.map((slot) => {
              // Convert 24h format to 12h format for display
              const [hour] = slot.time.split(':');
              const hourNum = parseInt(hour);
              const displayTime = format(
                new Date().setHours(hourNum, 0, 0),
                'h:mm a'
              );

              return (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  onClick={() => onTimeSelect(slot.time)}
                  disabled={!slot.available}
                  className={`w-full ${!slot.available ? 'opacity-50' : ''}`}
                >
                  {displayTime}
                </Button>
              );
            })
          ) : (
            <div className="col-span-2 text-center text-gray-500 py-4">
              No available time slots for this date
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}