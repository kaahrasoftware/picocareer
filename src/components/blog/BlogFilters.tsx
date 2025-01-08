import { SearchInput } from "./filters/SearchInput";
import { CategorySelect } from "./filters/CategorySelect";
import { SubcategorySelect } from "./filters/SubcategorySelect";
import { RecentToggle } from "./filters/RecentToggle";
import { Database } from "@/integrations/supabase/types";
import { useState } from "react";
import { Filter, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

type Categories = Database["public"]["Enums"]["categories"];

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: Categories | "_all";
  setSelectedCategory: (value: Categories | "_all") => void;
  selectedSubcategory: string;
  setSelectedSubcategory: (value: string) => void;
  showRecentOnly: boolean;
  setShowRecentOnly: (value: boolean) => void;
}

export function BlogFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedSubcategory,
  setSelectedSubcategory,
  showRecentOnly,
  setShowRecentOnly,
}: BlogFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="grid gap-6 mb-8">
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <SearchInput 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>
        
        {/* Mobile Filter Toggle */}
        <div className="md:hidden">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Filter Content */}
        <div className={`flex flex-col gap-4 md:flex-row ${isExpanded ? 'block' : 'hidden md:flex'}`}>
          <CategorySelect 
            selectedCategory={selectedCategory} 
            setSelectedCategory={setSelectedCategory} 
          />
          <SubcategorySelect 
            selectedCategory={selectedCategory}
            selectedSubcategory={selectedSubcategory}
            setSelectedSubcategory={setSelectedSubcategory}
          />
          <RecentToggle 
            showRecentOnly={showRecentOnly}
            setShowRecentOnly={setShowRecentOnly}
          />
        </div>
      </div>
    </div>
  );
}