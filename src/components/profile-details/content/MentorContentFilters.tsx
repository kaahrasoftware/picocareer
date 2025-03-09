
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";

interface MentorContentFiltersProps {
  contentType: string | null;
  setContentType: (value: string | null) => void;
  dateRange: {from: Date | undefined, to: Date | undefined};
  setDateRange: (value: {from: Date | undefined, to: Date | undefined}) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
}

export function MentorContentFilters({
  contentType,
  setContentType,
  dateRange,
  setDateRange,
  searchQuery,
  setSearchQuery
}: MentorContentFiltersProps) {
  const contentTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'presentation', label: 'Presentation' },
    { value: 'document', label: 'Document' },
    { value: 'spreadsheet', label: 'Spreadsheet' },
    { value: 'image', label: 'Image' },
    { value: 'blog', label: 'Blog' },
    { value: 'link', label: 'Link' },
    { value: 'other', label: 'Other' }
  ];

  const clearFilters = () => {
    setContentType(null);
    setDateRange({ from: undefined, to: undefined });
    setSearchQuery("");
  };

  const hasActiveFilters = contentType !== null || dateRange.from !== undefined || dateRange.to !== undefined || searchQuery !== "";

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap flex-1">
      <Input
        placeholder="Search by title or description..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
      />

      <Select
        value={contentType || ""}
        onValueChange={(value) => setContentType(value || null)}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Content Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Types</SelectItem>
          {contentTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`justify-start text-left font-normal ${
              dateRange.from || dateRange.to ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange.from || dateRange.to ? (
              dateRange.from && dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                <>
                  {dateRange.from ? format(dateRange.from, "LLL dd, y") : ""}
                  {dateRange.to ? format(dateRange.to, "LLL dd, y") : ""}
                </>
              )
            ) : (
              <span>Date Range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={(range) => {
              setDateRange({ 
                from: range?.from, 
                to: range?.to 
              });
            }}
            numberOfMonths={1}
          />
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-8"
        >
          <X className="h-4 w-4 mr-1" /> Clear Filters
        </Button>
      )}
    </div>
  );
}
