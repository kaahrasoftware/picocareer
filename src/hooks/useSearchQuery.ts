import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "./useDebounce";
import { useSearchAnalytics } from "./useSearchAnalytics";
import { useToast } from "./use-toast";
import { SearchResult } from "@/types/search";

export const useSearchQuery = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch } = useSearchAnalytics();
  const { toast } = useToast();

  const handleSearch = async (value: string): Promise<SearchResult[]> => {
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
            top_mentor,
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
            `skills.contains.{${value}},` +
            `tools_used.contains.{${value}},` +
            `keywords.contains.{${value}},` +
            `fields_of_interest.contains.{${value}}`
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
            `keywords.contains.{${value}},` +
            `required_skills.contains.{${value}},` +
            `required_tools.contains.{${value}}`
          )
          .limit(5),

        // Search majors - using citext arrays
        supabase
          .from('majors')
          .select('*')
          .or(
            `title.ilike.%${value}%,` +
            `description.ilike.%${value}%,` +
            `learning_objectives.contains.{${value}},` +
            `common_courses.contains.{${value}},` +
            `skill_match.contains.{${value}},` +
            `tools_knowledge.contains.{${value}}`
          )
          .limit(5)
      ]);

      if (mentorsResponse.error) throw mentorsResponse.error;
      if (careersResponse.error) throw careersResponse.error;
      if (majorsResponse.error) throw majorsResponse.error;

      const combinedResults: SearchResult[] = [
        ...(mentorsResponse.data || []).map(mentor => ({
          id: mentor.id,
          type: 'mentor' as const,
          title: `${mentor.first_name} ${mentor.last_name}`,
          description: mentor.bio || mentor.position,
          avatar_url: mentor.avatar_url,
          position: mentor.position,
          top_mentor: mentor.top_mentor || false
        })),
        ...(careersResponse.data || []).map(career => ({
          id: career.id,
          type: 'career' as const,
          title: career.title,
          description: career.description,
          salary_range: career.salary_range
        })),
        ...(majorsResponse.data || []).map(major => ({
          id: major.id,
          type: 'major' as const,
          title: major.title,
          description: major.description,
          degree_levels: major.degree_levels,
          career_opportunities: major.career_opportunities,
          common_courses: major.common_courses
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