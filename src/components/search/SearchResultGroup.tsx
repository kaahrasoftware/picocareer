import { CommandGroup } from "@/components/ui/command";
import { SearchResultItem } from "./SearchResultItem";
import type { SearchResult } from "@/hooks/useSearchData";

interface SearchResultGroupProps {
  category: string;
  items: SearchResult[];
  onClose: () => void;
}

export const SearchResultGroup = ({ category, items, onClose }: SearchResultGroupProps) => {
  if (!items?.length) return null;

  return (
    <CommandGroup 
      heading={category.charAt(0).toUpperCase() + category.slice(1)}
      className="px-2"
    >
      {items.map((result) => (
        <SearchResultItem
          key={result.id}
          result={result}
          onSelect={() => {
            console.log("Selected:", result);
            onClose();
          }}
        />
      ))}
    </CommandGroup>
  );
};
