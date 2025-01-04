import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";

export const useSearchResults = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch } = useSearchAnalytics();
  const { session } = useAuthSession();

  const handleSearch = async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    console.log('Fetching results for query:', value);

    try {
      // Build mentor query
      const mentorQuery = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          avatar_url,
          location,
          bio,
          skills,
          tools_used,
          keywords,
          fields_of_interest,
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
          `location.ilike.%${value}%`
        );

      // Add array searches
      const mentorArrayFields = ['skills', 'tools_used', 'keywords', 'fields_of_interest'];
      mentorArrayFields.forEach(field => {
        mentorQuery.or(`${field}.cs.{${value}}`);
      });

      // Build career query
      const careerQuery = supabase
        .from('careers')
        .select('*')
        .eq('complete_career', true)
        .or(
          `title.ilike.%${value}%,` +
          `description.ilike.%${value}%,` +
          `important_note.ilike.%${value}%,` +
          `stress_levels.ilike.%${value}%,` +
          `growth_potential.ilike.%${value}%,` +
          `work_environment.ilike.%${value}%,` +
          `industry.ilike.%${value}%,` +
          `job_outlook.ilike.%${value}%`
        );

      // Add array searches
      const careerArrayFields = [
        'careers_to_consider_switching_to',
        'transferable_skills',
        'keywords',
        'required_tools',
        'required_skills',
        'academic_majors'
      ];
      careerArrayFields.forEach(field => {
        careerQuery.or(`${field}.cs.{${value}}`);
      });

      // Build major query
      const majorQuery = supabase
        .from('majors')
        .select('*')
        .or(
          `title.ilike.%${value}%,` +
          `description.ilike.%${value}%`
        );

      // Add array searches
      const majorArrayFields = [
        'learning_objectives',
        'common_courses',
        'skill_match',
        'tools_knowledge',
        'career_opportunities'
      ];
      majorArrayFields.forEach(field => {
        majorQuery.or(`${field}.cs.{${value}}`);
      });

      console.log('Executing queries with value:', value);
      const [mentorsResponse, careersResponse, majorsResponse] = await Promise.all([
        mentorQuery,
        careerQuery,
        majorQuery
      ]);

      if (mentorsResponse.error) {
        console.error('Mentors query error:', mentorsResponse.error);
        throw mentorsResponse.error;
      }
      if (careersResponse.error) {
        console.error('Careers query error:', careersResponse.error);
        throw careersResponse.error;
      }
      if (majorsResponse.error) {
        console.error('Majors query error:', majorsResponse.error);
        throw majorsResponse.error;
      }

      console.log('Raw query responses:', {
        mentors: mentorsResponse,
        careers: careersResponse,
        majors: majorsResponse
      });

      const combinedResults = [
        ...(mentorsResponse.data || []).map(mentor => ({
          ...mentor,
          type: 'mentor',
          title: `${mentor.first_name} ${mentor.last_name}`,
          description: mentor.bio || mentor.career?.title
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

      console.log('Combined search results:', combinedResults);
      setSearchResults(combinedResults);
      
      // Only track search if user is authenticated
      if (session?.user?.id) {
        await trackSearch(value, combinedResults.length);
      }
    } catch (error) {
      console.error('Error in search:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Use debounce for search
  const debouncedSearch = useDebounce(handleSearch, 300);

  return {
    searchResults,
    isLoading,
    handleSearch: debouncedSearch,
    setSearchResults
  };
};