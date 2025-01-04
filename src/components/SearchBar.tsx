import { useState, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { searchMentors, searchCareers, searchMajors } from "@/utils/searchUtils";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ className = "", placeholder }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch } = useSearchAnalytics();
  const { session } = useAuthSession();
  const { toast } = useToast();

  const handleSearch = async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    console.log('Fetching results for query:', value);

    try {
      const [mentorsResponse, careersResponse, majorsResponse] = await Promise.all([
        searchMentors(value),
        searchCareers(value),
        searchMajors(value)
      ]);

      if (mentorsResponse.error) throw mentorsResponse.error;
      if (careersResponse.error) throw careersResponse.error;
      if (majorsResponse.error) throw majorsResponse.error;

      const combinedResults = [
        ...(mentorsResponse.data || []).map(mentor => ({
          ...mentor,
          type: 'mentor',
          title: `${mentor.first_name} ${mentor.last_name}`,
          description: mentor.bio || mentor.position,
          company_name: mentor.company?.name,
          school_name: mentor.school?.name,
          academic_major_title: mentor.academic_major?.title,
          career_title: mentor.career?.title
        })),
        ...(careersResponse.data || []).map(career => ({
          ...career,
          type: 'career'
        })),
        ...(majorsResponse.data || []).map(major => ({
          ...major,
          type: 'major'
        }))
      ];

      console.log('Search results:', combinedResults);
      setSearchResults(combinedResults);
      
      // Only track search if user is authenticated
      if (session?.user?.id) {
        await trackSearch(value, combinedResults.length);
      }
    } catch (error) {
      console.error('Error in search:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use debounce for search
  const debouncedSearch = useDebounce(handleSearch, 300);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const isSearchContainer = target.closest('.search-container');
    const isSearchResults = target.closest('.search-results');
    
    if (!isSearchContainer && !isSearchResults) {
      setIsFocused(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full search-container mb-24">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          className={className}
          placeholder={placeholder || "Search mentors, careers, or majors..."}
        />
      </div>
      
      {isFocused && (
        <div className="absolute top-full mt-1 w-full z-50 border border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg rounded-lg overflow-hidden p-4">
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
      )}
    </div>
  );
};