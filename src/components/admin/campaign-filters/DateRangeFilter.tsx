
import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface DateRangeFilterProps {
  value: {
    from: Date | null;
    to: Date | null;
  };
  onChange: (value: { from: Date | null; to: Date | null }) => void;
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const formatDateRange = () => {
    if (value.from && value.to) {
      return `${format(value.from, 'MMM dd')} - ${format(value.to, 'MMM dd')}`;
    } else if (value.from) {
      return `From ${format(value.from, 'MMM dd')}`;
    } else if (value.to) {
      return `Until ${format(value.to, 'MMM dd')}`;
    }
    return 'Select date range';
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formatDateRange()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={{
            from: value.from || undefined,
            to: value.to || undefined
          }}
          onSelect={(range) => {
            onChange({
              from: range?.from || null,
              to: range?.to || null
            });
            if (range?.from && range?.to) {
              setIsOpen(false);
            }
          }}
          numberOfMonths={2}
        />
        <div className="p-3 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({ from: null, to: null });
              setIsOpen(false);
            }}
            className="w-full"
          >
            Clear
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
