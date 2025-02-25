
import { AnnouncementCategory } from "@/types/database/hubs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CategorySelectProps {
  value: AnnouncementCategory;
  onValueChange: (value: AnnouncementCategory) => void;
}

const CATEGORY_OPTIONS: AnnouncementCategory[] = ['event', 'news', 'alert', 'general'];

export function CategorySelect({ value, onValueChange }: CategorySelectProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none">Category</label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORY_OPTIONS.map((category) => (
            <SelectItem key={category} value={category}>
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
