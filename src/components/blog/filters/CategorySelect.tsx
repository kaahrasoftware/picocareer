import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "../data/categories";

interface CategorySelectProps {
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
}

export function CategorySelect({ selectedCategory, setSelectedCategory }: CategorySelectProps) {
  return (
    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">All Categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category} value={category}>
            {category}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}