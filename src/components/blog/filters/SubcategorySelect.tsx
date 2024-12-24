import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subcategories } from "../data/subcategories";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

interface SubcategorySelectProps {
  selectedCategory: string;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
}

export function SubcategorySelect({ 
  selectedCategory, 
  selectedSubcategory, 
  setSelectedSubcategory 
}: SubcategorySelectProps) {
  return (
    <Select 
      value={selectedSubcategory} 
      onValueChange={setSelectedSubcategory}
      disabled={!selectedCategory || selectedCategory === "_all"}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select subcategory" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">All Subcategories</SelectItem>
        {selectedCategory && selectedCategory !== "_all" && 
          subcategories[selectedCategory as Categories]?.map((subcategory) => (
            <SelectItem key={subcategory} value={subcategory}>
              {subcategory}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}