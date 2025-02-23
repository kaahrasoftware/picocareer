
import { SortDesc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AnnouncementFiltersProps {
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  onSortToggle: () => void;
  categoryColors: Record<string, string>;
}

export function AnnouncementFilters({
  selectedCategory,
  onCategoryChange,
  onSortToggle,
  categoryColors
}: AnnouncementFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <Select value={selectedCategory} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filter by category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.keys(categoryColors).map(category => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="icon" onClick={onSortToggle}>
        <SortDesc className="h-4 w-4" />
      </Button>
    </div>
  );
}
