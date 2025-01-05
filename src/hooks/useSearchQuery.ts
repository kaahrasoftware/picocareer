import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./useDebounce";
import { useSearchAnalytics } from "./useSearchAnalytics";
import { useToast } from "./use-toast";

export const useSearchQuery = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch } = useSearchAnalytics();
  const { toast } = useToast();

  const handleSearch = async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return [];
    }

    setIsLoading(true);
    console.log('Fetching results for query:', value);

    try {
      const [mentorsResponse, careersResponse, majorsResponse] = await Promise.all([
        // Search mentors - using citext arrays
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
            `skills.contains.{${value}},` + // Using citext[] containment
            `tools_used.contains.{${value}},` + // Using citext[] containment
            `keywords.contains.{${value}},` + // Using citext[] containment
            `fields_of_interest.contains.{${value}}` // Using citext[] containment
          )
          .limit(5),

        // Search careers - using citext arrays
        supabase
          .from('careers')
          .select('*')
          .eq('complete_career', true)
          .or(
            `title.ilike.%${value}%,` +
            `description.ilike.%${value}%,` +
            `keywords.contains.{${value}},` + // Using citext[] containment
            `required_skills.contains.{${value}},` + // Using citext[] containment
            `required_tools.contains.{${value}}` // Using citext[] containment
          )
          .limit(5),

        // Search majors - using citext arrays
        supabase
          .from('majors')
          .select('*')
          .or(
            `title.ilike.%${value}%,` +
            `description.ilike.%${value}%,` +
            `learning_objectives.contains.{${value}},` + // Using citext[] containment
            `common_courses.contains.{${value}},` + // Using citext[] containment
            `skill_match.contains.{${value}},` + // Using citext[] containment
            `tools_knowledge.contains.{${value}}` // Using citext[] containment
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
      
      return combinedResults;
    } catch (error) {
      console.error('Error in search:', error);
      toast({
        title: "Search Error",
        description: "Failed to fetch search results. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useDebounce(handleSearch, 300);

  return {
    searchResults,
    isLoading,
    handleSearch: debouncedSearch,
    setSearchResults
  };
};