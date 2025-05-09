import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFilterProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: string[];
  className?: string;
}

export function SelectFilter({ value, onValueChange, placeholder, options = [], className }: SelectFilterProps) {
  return (
    <Select value={value || "all"} onValueChange={(value) => onValueChange(value === "all" ? null : value)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}s</SelectItem>
        {Array.isArray(options) && options.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}