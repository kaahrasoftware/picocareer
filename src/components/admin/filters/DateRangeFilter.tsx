
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
}

export function DateRangeFilter({ onDateRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    onDateRangeChange(startDate, endDate);
  }, [startDate, endDate, onDateRangeChange]);

  const handleClear = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setIsOpen(false);
  };

  const dateRangeText = startDate && endDate
    ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
    : "Filter by join date";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            (startDate || endDate) && "text-primary"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {dateRangeText}
          {(startDate || endDate) && (
            <X 
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100" 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3 space-y-4">
          <div>
            <div className="text-sm mb-2 text-muted-foreground">Start Date</div>
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={setStartDate}
              initialFocus
            />
          </div>
          <div>
            <div className="text-sm mb-2 text-muted-foreground">End Date</div>
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={setEndDate}
              initialFocus
              disabled={(date) => startDate ? date < startDate : false}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
