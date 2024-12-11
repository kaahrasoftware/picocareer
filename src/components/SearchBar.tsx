import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SearchResults } from "./SearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { Search } from "lucide-react";

interface SearchBarProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const SearchBar = ({ className, ...props }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);

  return (
    <div className="relative w-full">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            className="w-full h-10 pl-9 pr-4 rounded-md bg-background border border-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={(e) => {
              if (!e.relatedTarget?.closest('.search-results')) {
                setIsFocused(false);
              }
            }}
            {...props}
          />
        </div>
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