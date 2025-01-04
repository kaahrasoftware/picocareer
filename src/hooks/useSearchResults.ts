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
          ),

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
          ),

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