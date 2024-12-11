import { Button } from "@/components/ui/button";
import { format, parse, addMinutes } from "date-fns";
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

  // Generate 15-minute time slots between start and end times
  const generateTimeSlots = () => {
    if (!availableTimeSlots.length) return [];

    const slots: TimeSlot[] = [];
    availableTimeSlots.forEach(availability => {
      const startTime = parse(availability.time, 'HH:mm', new Date());
      const endTime = addMinutes(startTime, 60); // Assuming 1-hour blocks from original data

      let currentTime = startTime;
      while (currentTime < endTime) {
        slots.push({
          time: format(currentTime, 'HH:mm'),
          available: availability.available
        });
        currentTime = addMinutes(currentTime, 15);
      }
    });

    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div>
      <h4 className="font-semibold mb-2">
        Available Times for {format(date, "MMMM d, yyyy")}
      </h4>
      <ScrollArea className="h-[200px] rounded-md border border-kahra-darker">
        <div className="grid grid-cols-2 gap-2 p-4">
          {timeSlots.length > 0 ? (
            timeSlots.map((slot) => {
              const displayTime = format(
                parse(slot.time, 'HH:mm', new Date()),
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