import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface DateSelectorProps {
  date: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  userTimezone: string;
}

export function DateSelector({ date, onDateSelect, userTimezone }: DateSelectorProps) {
  return (
    <div>
      <h4 className="font-semibold mb-2">Select Date</h4>
      <Calendar
        mode="single"
        selected={date}
        onSelect={onDateSelect}
        className="bg-kahra-darker rounded-lg p-4"
        disabled={(date) => date < new Date()}
      />
      <div className="mt-4 text-sm text-gray-400">
        <p>Your timezone: {userTimezone}</p>
      </div>
    </div>
  );
}