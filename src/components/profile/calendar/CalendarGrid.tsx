
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { isSameDay } from "date-fns";

interface CalendarGridProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  renderDateCellContent?: (date: Date) => React.ReactNode;
}

export function CalendarGrid({ 
  selectedDate, 
  onDateSelect, 
  renderDateCellContent 
}: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate);

  // Update internal state when selectedDate prop changes
  useEffect(() => {
    setCurrentDate(selectedDate);
  }, [selectedDate]);

  // Custom day rendering function to add indicators
  const renderDay = (day: Date, modifiers: any) => {
    if (renderDateCellContent) {
      return (
        <div>
          <div>{day.getDate()}</div>
          {renderDateCellContent(day)}
        </div>
      );
    }
    return <div>{day.getDate()}</div>;
  };

  return (
    <Calendar
      mode="single"
      selected={currentDate}
      onSelect={(date) => {
        if (date) {
          setCurrentDate(date);
          onDateSelect(date);
        }
      }}
      className="rounded-md border"
      components={{
        Day: ({ date, ...props }) => (
          <button
            {...props}
            className={`relative p-3 text-sm transition-colors data-[disabled]:opacity-50 
                      ${isSameDay(date, selectedDate) ? 'bg-primary text-primary-foreground rounded-md' : ''}
                      ${isSameDay(date, new Date()) && !isSameDay(date, selectedDate) ? 'border border-primary' : ''}`}
          >
            {renderDay(date, props)}
          </button>
        ),
      }}
    />
  );
}
