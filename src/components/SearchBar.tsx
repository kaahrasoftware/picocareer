import { useState } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchMentors } from "@/hooks/useSearchMentors";
import { useSearchMajors } from "@/hooks/useSearchMajors";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ className = "", placeholder }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { searchMentors, isLoading: isMentorsLoading } = useSearchMentors();
  const { searchMajors, isLoading: isMajorsLoading } = useSearchMajors();

  const handleSearch = async (value: string) => {
    const [mentorResults, majorResults] = await Promise.all([
      searchMentors(value),
      searchMajors(value)
    ]);
    setSearchResults([...mentorResults, ...majorResults]);
  };

  // Use debounce for search
  const debouncedSearch = useDebounce(handleSearch, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleCloseSearch = () => {
    setIsFocused(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const isLoading = isMentorsLoading || isMajorsLoading;

  return (
    <div className="relative w-full search-container mb-24">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          className={className}
          placeholder={placeholder || "Search mentors and majors..."}
        />
      </div>
      
      {isFocused && (
        <div className="absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-red-100 text-red-600 hover:text-red-700"
              onClick={handleCloseSearch}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-4">
              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground">
                  Searching...
                </div>
              ) : searchQuery.length < 3 ? (
                <div className="text-center py-4 text-muted-foreground">
                  Type at least 3 characters to search...
                </div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No results found
                </div>
              ) : (
                <MentorSearchResults results={searchResults} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};