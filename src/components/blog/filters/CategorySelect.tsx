import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categories } from "../data/categories";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

interface CategorySelectProps {
  selectedCategory: Categories | "_all";
  setSelectedCategory: (value: Categories | "_all") => void;
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