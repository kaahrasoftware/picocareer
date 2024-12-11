import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { useAvailableDates } from "@/hooks/useAvailableDates";

interface DateSelectorProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  userTimezone: string;
  mentorId: string;
}

export function DateSelector({ date, onDateSelect, userTimezone, mentorId }: DateSelectorProps) {
  const availableDates = useAvailableDates(mentorId);

  const isDateAvailable = (date: Date) => {
    return availableDates.some(availableDate => 
      availableDate.getDate() === date.getDate() &&
      availableDate.getMonth() === date.getMonth() &&
      availableDate.getFullYear() === date.getFullYear()
    );
  };

  return (
    <div>
      <h4 className="font-semibold mb-2">Select Date</h4>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        className="bg-kahra-darker rounded-lg p-4"
        disabled={(date) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return date < today || !isDateAvailable(date);
        }}
        modifiers={{
          available: availableDates
        }}
        modifiersStyles={{
          available: {
            border: '2px solid #22c55e',
            borderRadius: '4px'
          }
        }}
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>Your timezone: {userTimezone}</p>
        <p className="mt-1">Days highlighted in green are available for booking</p>
      </div>
    </div>
  );
}