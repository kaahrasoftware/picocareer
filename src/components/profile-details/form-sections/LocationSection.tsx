import { Input } from "@/components/ui/input";

interface LocationSectionProps {
  location: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocationSection({ location, handleInputChange }: LocationSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Location</h3>
      <div>
        <Input
          name="location"
          value={location}
          onChange={handleInputChange}
          className="mt-1"
          placeholder="City, Country"
        />
      </div>
    </div>
  );
}