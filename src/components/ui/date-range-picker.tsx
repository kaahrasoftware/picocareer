
import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { addDays, format } from "date-fns"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
  className?: string
}

export function DatePickerWithRange({
  date,
  onDateChange,
  className,
}: DatePickerWithRangeProps) {
  const [selectedDateRange, setSelectedDateRange] = React.useState<DateRange | undefined>(date)

  React.useEffect(() => {
    setSelectedDateRange(date)
  }, [date])

  const handleSelect = (range: DateRange | undefined) => {
    setSelectedDateRange(range)
    onDateChange(range)
  }

  const handlePreset = (days: number) => {
    const today = new Date()
    const from = today
    const to = addDays(today, days)
    const range = { from, to }
    handleSelect(range)
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        initialFocus
        mode="range"
        defaultMonth={date?.from}
        selected={selectedDateRange}
        onSelect={handleSelect}
        numberOfMonths={2}
      />
      <div className="flex gap-2 mt-2 px-3 pb-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset(7)}
          className="text-xs"
        >
          Next 7 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePreset(30)}
          className="text-xs"
        >
          Next 30 days
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSelect(undefined)}
          className="text-xs ml-auto"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
