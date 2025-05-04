
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type TimePeriod = 'week' | 'month' | 'quarter' | 'year' | 'all';

interface TimePeriodSelectProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
}

export function TimePeriodSelect({ value, onChange }: TimePeriodSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as TimePeriod)}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select time period" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem value="week">Last 7 days</SelectItem>
          <SelectItem value="month">Last 30 days</SelectItem>
          <SelectItem value="quarter">Last 3 months</SelectItem>
          <SelectItem value="year">Last 12 months</SelectItem>
          <SelectItem value="all">All time</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
