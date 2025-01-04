import { useState, useEffect } from "react";
import { SearchInput } from "./search/SearchInput";
import { MentorSearchResults } from "./search/MentorSearchResults";
import { useDebounce } from "@/hooks/useDebounce";
import { supabase } from "@/integrations/supabase/client";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
          .or(
            `first_name.ilike.%${value}%,` +
            `last_name.ilike.%${value}%,` +
            `full_name.ilike.%${value}%,` +
            `bio.ilike.%${value}%,` +
            `location.ilike.%${value}%,` +
            `skills.cs.{${value.toLowerCase()}},` +
            `tools_used.cs.{${value.toLowerCase()}},` +
            `keywords.cs.{${value.toLowerCase()}},` +
            `fields_of_interest.cs.{${value.toLowerCase()}}`
          )
          .limit(5),

        // Search careers with expanded fields
        supabase
          .from('careers')
          .select('*')
          .eq('complete_career', true)
          .or(
            `title.ilike.%${value}%,` +
            `description.ilike.%${value}%,` +
            `important_note.ilike.%${value}%,` +
            `stress_levels.ilike.%${value}%,` +
            `careers_to_consider_switching_to.cs.{${value.toLowerCase()}},` +
            `transferable_skills.cs.{${value.toLowerCase()}},` +
            `keywords.cs.{${value.toLowerCase()}},` +
            `growth_potential.ilike.%${value}%,` +
            `work_environment.ilike.%${value}%,` +
            `industry.ilike.%${value}%,` +
            `job_outlook.ilike.%${value}%,` +
            `required_tools.cs.{${value.toLowerCase()}},` +
            `required_skills.cs.{${value.toLowerCase()}},` +
            `academic_majors.cs.{${value.toLowerCase()}}`
          )
          .limit(5),

        // Search majors
        supabase
          .from('majors')
          .select('*')
          .or(
            `title.ilike.%${value}%,` +
            `description.ilike.%${value}%,` +
            `learning_objectives.cs.{${value.toLowerCase()}},` +
            `common_courses.cs.{${value.toLowerCase()}},` +
            `skill_match.cs.{${value.toLowerCase()}},` +
            `tools_knowledge.cs.{${value.toLowerCase()}}`
          )
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
    // Do nothing when clicking outside - we want the search results to stay open
    return;
  };

  const handleCloseSearch = () => {
    setIsFocused(false);
    setSearchQuery("");
    setSearchResults([]);
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