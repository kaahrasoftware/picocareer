import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface ExistingTimeSlotsProps {
  slots: TimeSlot[];
  onDelete: (slotId: string) => void;
}

export function ExistingTimeSlots({ slots, onDelete }: ExistingTimeSlotsProps) {
  if (slots.length === 0) return null;

  return (
    <div className="mt-6 space-y-3">
      <h4 className="font-medium">Available Time Slots</h4>
      <div className="grid gap-2 sm:grid-cols-2">
        {slots.map((slot) => (
          <div 
            key={slot.id}
            className="flex items-center justify-between p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
          >
            <span className="text-sm">
              {format(new Date(`2000-01-01T${slot.start_time}`), 'h:mm a')} - 
              {format(new Date(`2000-01-01T${slot.end_time}`), 'h:mm a')}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(slot.id)}
              className="h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}