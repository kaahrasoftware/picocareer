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
    // Convert value to string, handling all edge cases
    const stringValue = Array.isArray(value) 
      ? value.filter(v => v != null).join(',')
      : typeof value === 'string' 
        ? value 
        : '';
    
    return (
      <Select
        value={stringValue}
        onValueChange={(val) => {
          if (!val) {
            onValueChange(null);
            return;
          }
          
          // Filter out empty strings and nullish values
          const values = val.split(',')
            .filter(v => v != null && v.trim() !== "");
          
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
  // Ensure we have a valid string value or "all"
  const currentValue = Array.isArray(value) 
    ? value[0] || "all"
    : typeof value === 'string' && value.trim() !== "" 
      ? value 
      : "all";
  
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