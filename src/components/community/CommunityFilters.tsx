import { useState, useEffect } from "react";
import { SelectFilter } from "./filters/SelectFilter";
import { SearchInput } from "./filters/SearchInput";

interface CommunityFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  fieldFilter: string | null;
  onFieldChange: (value: string | null) => void;
  fields: string[];
}

export function CommunityFilters({
  searchQuery,
  onSearchChange,
  fieldFilter,
  onFieldChange,
  fields,
}: CommunityFiltersProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      setIsScrolled(target.scrollTop > 20);
    };

    const dialogContent = document.querySelector('.max-h-\\[80vh\\]');
    dialogContent?.addEventListener('scroll', handleScroll);

    return () => {
      dialogContent?.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className={`space-y-4 transform transition-all duration-200 ${
        isScrolled ? 'p-2 space-y-2' : 'p-4'
      }`}>
        <div className="flex-1">
          <SearchInput 
            value={searchQuery} 
            onChange={onSearchChange}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />
        </div>

        <div className={`grid grid-cols-1 gap-4 ${
          isScrolled ? 'gap-2' : ''
        }`}>
          <SelectFilter
            value={fieldFilter}
            onValueChange={onFieldChange}
            placeholder="Category"
            options={fields}
            className={`transition-all duration-200 ${
              isScrolled ? 'h-8 text-sm' : 'h-10'
            }`}
          />
        </div>
      </div>
    </div>
  );
}