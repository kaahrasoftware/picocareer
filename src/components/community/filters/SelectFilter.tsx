import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFilterProps {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  options: string[];
}

export function SelectFilter({ value, onValueChange, placeholder, options }: SelectFilterProps) {
  return (
    <Select value={value || "all"} onValueChange={(value) => onValueChange(value === "all" ? null : value)}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {placeholder}s</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>{option}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}