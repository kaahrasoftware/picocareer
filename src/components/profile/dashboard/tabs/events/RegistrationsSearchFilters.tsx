
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface RegistrationsSearchFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedEvent: string;
}

export function RegistrationsSearchFilters({
  searchQuery,
  onSearchChange,
  selectedEvent
}: RegistrationsSearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
