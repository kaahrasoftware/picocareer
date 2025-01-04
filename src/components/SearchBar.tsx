import { useState, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const handleSearch = async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    console.log('Fetching results for query:', value);

    try {
      const [mentorsResponse, careersResponse, majorsResponse] = await Promise.all([
        // Search mentors
        supabase
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
          .or(`first_name.ilike.%${value}%,last_name.ilike.%${value}%,full_name.ilike.%${value}%,bio.ilike.%${value}%,location.ilike.%${value}%,careers.title.ilike.%${value}%`)
          .or(`skills.cs.{${value}}`)
          .or(`tools_used.cs.{${value}}`)
          .or(`keywords.cs.{${value}}`)
          .or(`fields_of_interest.cs.{${value}}`)
          .limit(5),

        // Search careers
        supabase
          .from('careers')
          .select('*')
          .eq('complete_career', true)
          .or(`title.ilike.%${value}%,description.ilike.%${value}%`)
          .or(`keywords.cs.{${value}}`)
          .or(`required_skills.cs.{${value}}`)
          .or(`required_tools.cs.{${value}}`)
          .limit(5),

        // Search majors
        supabase
          .from('majors')
          .select('*')
          .or(`title.ilike.%${value}%,description.ilike.%${value}%`)
          .or(`learning_objectives.cs.{${value}}`)
          .or(`common_courses.cs.{${value}}`)
          .or(`skill_match.cs.{${value}}`)
          .or(`tools_knowledge.cs.{${value}}`)
          .limit(5)
      ]);

      if (mentorsResponse.error) throw mentorsResponse.error;
      if (careersResponse.error) throw careersResponse.error;
      if (majorsResponse.error) throw majorsResponse.error;

      const combinedResults = [
        ...(mentorsResponse.data || []).map(mentor => ({
          ...mentor,
          type: 'mentor',
          title: `${mentor.first_name} ${mentor.last_name}`,
          description: mentor.bio || mentor.position
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