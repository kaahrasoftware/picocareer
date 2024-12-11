import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar = ({ className, ...props }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <input
          type="search"
          className="w-full h-12 pl-6 pr-24 rounded-full bg-white/95 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            // Only hide if not clicking within the results
            if (!e.relatedTarget?.closest('.search-results')) {
              setIsFocused(false);
            }
          }}
          {...props}
        />
        <Button 
          type="submit"
          className="absolute right-1 h-10 px-6 rounded-full bg-background hover:bg-background/90 text-foreground"
        >
          search
        </Button>
      </div>
      
      {isFocused && (
        <SearchResults 
          query={debouncedSearch} 
          onClose={() => {
            setSearchQuery("");
            setIsFocused(false);
          }} 
        />
      )}
    </div>
  );
};