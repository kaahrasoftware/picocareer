import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface EventHeaderProps {
  filter: 'upcoming' | 'past';
  onFilterChange: (value: 'upcoming' | 'past') => void;
}

export function EventHeader({ filter, onFilterChange }: EventHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold">Events</h1>
        <p className="text-muted-foreground mt-2">
          Join our interactive events to learn from industry experts
        </p>
      </div>
      <ToggleGroup 
        type="single" 
        value={filter} 
        onValueChange={(value) => value && onFilterChange(value as 'upcoming' | 'past')}
      >
        <ToggleGroupItem value="upcoming" aria-label="Show upcoming events">
          Upcoming
        </ToggleGroupItem>
        <ToggleGroupItem value="past" aria-label="Show past events">
          Past
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}