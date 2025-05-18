
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search, Filter as FilterIcon, X } from "lucide-react";

interface SchoolFiltersProps {
  onFilterChange: (filters: SchoolFilters) => void;
  onSearch: (searchTerm: string) => void;
}

export interface SchoolFilters {
  type: string;
  country: string;
}

export function SchoolFilters({ onFilterChange, onSearch }: SchoolFiltersProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<SchoolFilters>({
    type: "all",
    country: "all"
  });
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleFilterChange = (key: keyof SchoolFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClearFilters = () => {
    const resetFilters = {
      type: "all",
      country: "all"
    };
    setFilters(resetFilters);
    setSearchTerm("");
    onFilterChange(resetFilters);
    onSearch("");
  };

  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search schools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        </div>
        <Button onClick={handleSearch} className="shrink-0">
          Search
        </Button>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shrink-0"
        >
          <FilterIcon className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <Accordion type="single" collapsible defaultValue="filters" className="border rounded-md">
          <AccordionItem value="filters" className="border-none">
            <AccordionTrigger className="px-4">Filters</AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type-filter">Institution Type</Label>
                  <Select 
                    value={filters.type} 
                    onValueChange={(value) => handleFilterChange('type', value)}
                  >
                    <SelectTrigger id="type-filter">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="Community College">Community College</SelectItem>
                      <SelectItem value="High School">High School</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country-filter">Country</Label>
                  <Select 
                    value={filters.country} 
                    onValueChange={(value) => handleFilterChange('country', value)}
                  >
                    <SelectTrigger id="country-filter">
                      <SelectValue placeholder="All Countries" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1"
                >
                  <X className="h-3 w-3" />
                  Clear Filters
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
}
