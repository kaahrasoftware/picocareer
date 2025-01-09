import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { MentorAvailability } from "@/types/calendar";

interface AvailabilitySlotProps {
  availability: MentorAvailability;
  onDelete: (id: string) => void;
}

export function AvailabilitySlot({ availability, onDelete }: AvailabilitySlotProps) {
  const handleDelete = () => {
    onDelete(availability.id);
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "";
    return format(new Date(dateString), "h:mm a");
  };

  const getTimeRange = () => {
    const startTime = formatTime(availability.start_date_time);
    const endTime = formatTime(availability.end_date_time);
    return `${startTime} - ${endTime}`;
  };

  const getDayInfo = () => {
    if (availability.recurring && availability.day_of_week !== null) {
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      return `Every ${days[availability.day_of_week]}`;
    }
    return availability.start_date_time 
      ? format(new Date(availability.start_date_time), "MMMM d, yyyy")
      : "";
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow">
      <div>
        <p className="font-medium">{getDayInfo()}</p>
        <p className="text-sm text-muted-foreground">{getTimeRange()}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="text-destructive hover:text-destructive hover:bg-destructive/10"
      >
        Delete
      </Button>
    </div>
  );
}