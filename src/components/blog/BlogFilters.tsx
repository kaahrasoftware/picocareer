import { SearchInput } from "./filters/SearchInput";
import { CategorySelect } from "./filters/CategorySelect";
import { SubcategorySelect } from "./filters/SubcategorySelect";
import { RecentToggle } from "./filters/RecentToggle";

interface BlogFiltersProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
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
  return (
    <div className="grid gap-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchInput 
            searchQuery={searchQuery} 
            setSearchQuery={setSearchQuery} 
          />
        </div>
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
  );
}