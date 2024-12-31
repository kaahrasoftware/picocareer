import { useState, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

export const SearchBar = ({ className = "", placeholder }: SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const { trackSearch } = useSearchAnalytics();
  const { session } = useAuthSession();

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedSearch.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      console.log('Fetching results for query:', debouncedSearch);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            position,
            location,
            bio,
            skills,
            tools_used,
            keywords,
            fields_of_interest,
            highest_degree,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title),
            career:careers!profiles_position_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .or(
            `first_name.ilike.%${debouncedSearch}%,` +
            `last_name.ilike.%${debouncedSearch}%,` +
            `full_name.ilike.%${debouncedSearch}%,` +
            `bio.ilike.%${debouncedSearch}%,` +
            `location.ilike.%${debouncedSearch}%,` +
            `skills.cs.{${debouncedSearch}},` +
            `tools_used.cs.{${debouncedSearch}},` +
            `keywords.cs.{${debouncedSearch}},` +
            `fields_of_interest.cs.{${debouncedSearch}}`
          )
          .limit(5);

        if (error) {
          console.error('Error fetching search results:', error);
          return;
        }

        console.log('Search results:', data);
        setSearchResults(data || []);
        
        // Track search analytics only if user is authenticated
        if (trackSearch && debouncedSearch.length >= 3 && session?.user) {
          await trackSearch(debouncedSearch, data?.length || 0);
        }
      } catch (error) {
        console.error('Error in search:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [debouncedSearch, trackSearch, session]);

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
    <div className="relative w-full search-container">
      <div className="relative flex items-center w-full max-w-3xl mx-auto">
        <SearchInput
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setIsFocused(true)}
          className={className}
          placeholder={placeholder}
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