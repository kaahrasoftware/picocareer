import { Command, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command";
import { Card } from "@/components/ui/card";
import { useSearchData } from "@/hooks/useSearchData";
import { SearchResultGroup } from "./search/SearchResultGroup";
import type { SearchResult } from "@/hooks/useSearchData";

interface SearchResultsProps {
  query: string;
  onClose: () => void;
}

export const SearchResults = ({ query, onClose }: SearchResultsProps) => {
  const { data = [], isLoading } = useSearchData(query);
  
  const groupedResults: Record<string, SearchResult[]> = {
    careers: [],
    majors: [],
    mentors: [],
    blogs: []
  };

  // Group results by type
  data?.forEach(item => {
    if (item?.type) {
      const category = `${item.type}s`;
      if (category in groupedResults) {
        groupedResults[category].push(item);
      }
    }
  });

  const hasResults = Object.values(groupedResults).some(group => group.length > 0);

  const renderResults = () => {
    if (isLoading) {
      return <CommandEmpty>Searching...</CommandEmpty>;
    }
    
    if (!query) {
      return <CommandEmpty>Start typing to search...</CommandEmpty>;
    }
    
    if (query.length <= 2) {
      return <CommandEmpty>Type at least 3 characters to search...</CommandEmpty>;
    }
    
    if (!hasResults) {
      return <CommandEmpty>No results found.</CommandEmpty>;
    }

    return Object.entries(groupedResults).map(([category, items]) => (
      <SearchResultGroup
        key={category}
        category={category}
        items={items}
        onClose={onClose}
      />
    ));
  };

  return (
    <Card className="search-results absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden">
      <Command className="border-none bg-transparent">
        <CommandInput 
          placeholder="Type to search..." 
          value={query}
          readOnly
          className="h-9"
        />
        <CommandList className="max-h-[500px] overflow-y-auto scrollbar-thin">
          {renderResults()}
        </CommandList>
      </Command>
    </Card>
  );
};