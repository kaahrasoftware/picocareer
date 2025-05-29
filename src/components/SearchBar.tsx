
import { useState, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { useSearchMentors } from "@/hooks/useSearchMentors";
import { useSearchMajors } from "@/hooks/useSearchMajors";
import { useSearchCareers } from "@/hooks/useSearchCareers";
import { X } from "lucide-react";
import { Button } from "./ui/button";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  isSearchDialogOpen?: boolean;
  onSearchDialogChange?: (open: boolean) => void;
}

export const SearchBar = ({ 
  className = "", 
  placeholder,
  isSearchDialogOpen = false,
  onSearchDialogChange
}: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const { searchMentors, isLoading: isMentorsLoading } = useSearchMentors();
  const { searchMajors, isLoading: isMajorsLoading } = useSearchMajors();
  const { searchCareers, isLoading: isCareersLoading } = useSearchCareers();

  // Use debounced search function with a longer delay
  const performSearch = useDebouncedCallback(async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    console.log("Searching with query:", value);
    
    try {
      const [mentorResults, majorResults, careerResults] = await Promise.all([
        searchMentors(value),
        searchMajors(value),
        searchCareers(value)
      ]);

      console.log("Career search results:", careerResults);
      
      const formattedResults = [
        ...mentorResults.map(result => ({ ...result, type: 'mentor' })),
        ...majorResults.map(result => ({ ...result, type: 'major' })),
        ...careerResults.map(result => ({ ...result, type: 'career' }))
      ];

      setSearchResults(formattedResults);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  }, 800);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    performSearch(value);
  };

  const handleFocus = () => {
    onSearchDialogChange?.(true);
  };

  const handleCloseSearch = () => {
    onSearchDialogChange?.(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Effect to clear search results when query length is too short
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const isLoading = isMentorsLoading || isMajorsLoading || isCareersLoading;

  return (
    <div className="relative w-full search-container mb-16 isolate">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          className={className}
          placeholder={placeholder || "Search mentors, majors and careers..."}
        />
      </div>
      
      {isSearchDialogOpen && (
        <div className="absolute top-full mt-1 w-full z-[99999] border border-border/50 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 shadow-2xl rounded-lg overflow-hidden">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 hover:bg-red-100 text-red-600 hover:text-red-700 z-10"
              onClick={handleCloseSearch}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
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
}
