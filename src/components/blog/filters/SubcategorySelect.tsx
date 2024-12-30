import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subcategories } from "../data/subcategories";
import { Database } from "@/integrations/supabase/types";

type Categories = Database["public"]["Enums"]["categories"];

interface SubcategorySelectProps {
  selectedCategory: Categories | "_all";
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
}

export function SubcategorySelect({ 
  selectedCategory, 
  selectedSubcategory, 
  setSelectedSubcategory 
}: SubcategorySelectProps) {
  // Only disable if no category is selected or if "_all" is selected
  const isDisabled = selectedCategory === "_all";
  
  return (
    <Select 
      value={selectedSubcategory} 
      onValueChange={setSelectedSubcategory}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-full md:w-[200px]">
        <SelectValue placeholder="Select subcategory" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_all">All Subcategories</SelectItem>
        {selectedCategory && selectedCategory !== "_all" && 
          subcategories[selectedCategory]?.map((subcategory) => (
            <SelectItem key={subcategory} value={subcategory}>
              {subcategory}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  );
}