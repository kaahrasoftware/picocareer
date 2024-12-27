import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface MonthViewProps {
  date: Date;
  onSelectDate: (date: Date | undefined) => void;
  hasAvailability: (date: Date) => boolean;
}

export function MonthView({
  date,
  onSelectDate,
  hasAvailability
}: MonthViewProps) {
  return (
    <div className="p-4 h-full bg-background">
      <Calendar
        mode="single"
        selected={date}
        onSelect={onSelectDate}
        className="w-full rounded-md border-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4 w-full",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 rounded-md w-full font-normal text-[0.8rem] dark:text-gray-400",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            "h-9 w-full p-0 font-normal aria-selected:opacity-100",
            "hover:bg-accent hover:text-accent-foreground"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside: "text-gray-500 opacity-50 dark:text-gray-400",
          day_disabled: "text-gray-500 opacity-50 dark:text-gray-400",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
        }}
        components={{
          DayContent: ({ date: dayDate }) => (
            <div className="relative w-full h-full flex items-center justify-center">
              <span>{dayDate.getDate()}</span>
              {hasAvailability(dayDate) && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full" />
              )}
            </div>
          ),
        }}
      />
    </div>
  );
}