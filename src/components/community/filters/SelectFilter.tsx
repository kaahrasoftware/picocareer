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
    const stringValue = Array.isArray(value) ? value.join(',') : '';
    const displayValue = Array.isArray(value) ? value.join(', ') : '';

    return (
      <Select
        value={stringValue}
        onValueChange={(val) => {
          const values = val.split(',').filter(v => v !== "");
          onValueChange(values.length > 0 ? values : null);
        }}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder}>
            {displayValue}
          </SelectValue>
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
    <Select 
      value={value as string || "all"} 
      onValueChange={(value) => onValueChange(value === "all" ? null : value)}
    >
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