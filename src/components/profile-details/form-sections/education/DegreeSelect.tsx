import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DegreeSelectProps {
  value: string;
  handleSelectChange: (name: string, value: string) => void;
}

export function DegreeSelect({ value, handleSelectChange }: DegreeSelectProps) {
  const degreeOptions = [
    "No Degree",
    "High School",
    "Associate",
    "Bachelor",
    "Master",
    "MD",
    "PhD"
  ] as const;

  return (
    <div>
      <label className="text-sm font-medium">Highest Degree</label>
      <Select 
        value={value} 
        onValueChange={(value) => handleSelectChange('highest_degree', value)}
      >
        <SelectTrigger className="mt-1">
          <SelectValue placeholder="Select your highest degree" />
        </SelectTrigger>
        <SelectContent>
          {degreeOptions.map((degree) => (
            <SelectItem key={degree} value={degree}>
              {degree}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}