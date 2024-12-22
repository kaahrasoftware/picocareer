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
    // Convert value to string for multiple select
    const stringValue = Array.isArray(value) ? value.join(',') : (value || '');
    
    return (
      <Select
        value={stringValue}
        onValueChange={(val) => {
          const values = val ? val.split(',').filter(v => v !== "") : [];
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

  // Handle single select
  const currentValue = Array.isArray(value) ? value[0] : (value || "all");
  
  return (
    <Select 
      value={currentValue}
      onValueChange={(val) => onValueChange(val === "all" ? null : val)}
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