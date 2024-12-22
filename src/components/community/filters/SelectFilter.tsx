import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SelectFilterProps {
  value: string | string[] | null;
  onValueChange: (value: string | string[] | null) => void;
  placeholder: string;
  options: string[];
  multiple?: boolean;
}

export function SelectFilter({ value, onValueChange, placeholder, options, multiple }: SelectFilterProps) {
  if (multiple) {
    return (
      <Select
        value={value ? (Array.isArray(value) ? value.join(',') : value) : ""}
        onValueChange={(val) => {
          const values = val.split(',').filter(v => v !== "");
          onValueChange(values.length > 0 ? values : null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

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