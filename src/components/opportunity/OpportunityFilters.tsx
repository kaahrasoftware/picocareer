
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { OpportunityFilters as IOpportunityFilters } from "@/types/opportunity/types";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { useState } from "react";

const categories = [
  "Technology",
  "Healthcare",
  "Education",
  "Finance",
  "Engineering",
  "Marketing",
  "Design",
  "Research",
  "Non-profit",
  "Government",
];

interface OpportunityFiltersProps {
  filters: IOpportunityFilters;
  onFilterChange: (filters: Partial<IOpportunityFilters>) => void;
}

export function OpportunityFilters({ filters, onFilterChange }: OpportunityFiltersProps) {
  const [date, setDate] = useState<Date | undefined>(
    filters.deadline ? new Date(filters.deadline) : undefined
  );

  const handleLocationChange = (location: string) => {
    onFilterChange({ location: location || undefined });
  };

  const handleRemoteChange = (checked: boolean) => {
    onFilterChange({ remote: checked });
  };

  const handleFeaturedChange = (checked: boolean) => {
    onFilterChange({ featured: checked });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category });
  };

  const handleDateChange = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      onFilterChange({ deadline: selectedDate.toISOString() });
    } else {
      onFilterChange({ deadline: undefined });
    }
  };

  const clearFilters = () => {
    setDate(undefined);
    onFilterChange({
      location: undefined,
      remote: undefined,
      featured: undefined,
      category: undefined,
      deadline: undefined,
    });
  };

  return (
    <div className="bg-muted/40 p-6 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-semibold text-lg">Filters</h3>
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2">
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      </div>

      <div className="space-y-6">
        {/* Location filter */}
        <div>
          <Label className="mb-2 block">Location</Label>
          <Input
            placeholder="Any location"
            value={filters.location || ""}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="bg-background"
          />
        </div>

        {/* Remote filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remote"
            checked={filters.remote || false}
            onCheckedChange={(checked) => handleRemoteChange(checked as boolean)}
          />
          <Label htmlFor="remote">Remote options</Label>
        </div>

        {/* Featured filter */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="featured"
            checked={filters.featured || false}
            onCheckedChange={(checked) => handleFeaturedChange(checked as boolean)}
          />
          <Label htmlFor="featured">Featured only</Label>
        </div>

        {/* Deadline filter */}
        <div>
          <Label className="mb-2 block">Deadline</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal bg-background",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>No deadline</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Categories filter */}
        <div>
          <Label className="mb-2 block">Categories</Label>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center space-x-2">
                <Checkbox
                  id={`category-${category}`}
                  checked={filters.category === category}
                  onCheckedChange={() => handleCategoryChange(
                    filters.category === category ? undefined : category
                  )}
                />
                <Label htmlFor={`category-${category}`}>{category}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
