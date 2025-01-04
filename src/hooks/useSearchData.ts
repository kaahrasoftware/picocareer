import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSearchAnalytics } from "@/hooks/useSearchAnalytics";
import { useAuthSession } from "@/hooks/useAuthSession";

export type SearchResult = {
  id: string;
  type: 'mentor' | 'career' | 'major';
  title: string;
  description?: string;
  avatar_url?: string;
  position?: string;
  salary_range?: string;
  degree_levels?: string[];
  career_opportunities?: string[];
  top_mentor?: boolean;
};

export const useSearchData = () => {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackSearch } = useSearchAnalytics();
  const { session } = useAuthSession();

  const searchMentors = async (searchValue: string) => {
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
      .or(`first_name.ilike.%${searchValue}%,last_name.ilike.%${searchValue}%,full_name.ilike.%${searchValue}%,bio.ilike.%${searchValue}%,location.ilike.%${searchValue}%`)
      .contains('skills', [searchValue])
      .contains('tools_used', [searchValue])
      .contains('keywords', [searchValue])
      .contains('fields_of_interest', [searchValue])
      .limit(5);

    if (error) throw error;
    return data?.map(mentor => ({
      ...mentor,
      type: 'mentor' as const,
      title: `${mentor.first_name} ${mentor.last_name}`,
      description: mentor.bio || mentor.position
    }));
  };

  const searchCareers = async (searchValue: string) => {
    const { data, error } = await supabase
      .from('careers')
      .select('*')
      .eq('complete_career', true)
      .or(`title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`)
      .contains('keywords', [searchValue])
      .contains('required_skills', [searchValue])
      .contains('required_tools', [searchValue])
      .limit(5);

    if (error) throw error;
    return data?.map(career => ({
      ...career,
      type: 'career' as const
    }));
  };

  const searchMajors = async (searchValue: string) => {
    const { data, error } = await supabase
      .from('majors')
      .select('*')
      .or(`title.ilike.%${searchValue}%,description.ilike.%${searchValue}%`)
      .contains('learning_objectives', [searchValue])
      .contains('common_courses', [searchValue])
      .contains('skill_match', [searchValue])
      .contains('tools_knowledge', [searchValue])
      .limit(5);

    if (error) throw error;
    return data?.map(major => ({
      ...major,
      type: 'major' as const
    }));
  };

  const handleSearch = async (value: string) => {
    if (value.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    console.log('Fetching results for query:', value);

    try {
      const searchValue = value.toLowerCase();
      const [mentors, careers, majors] = await Promise.all([
        searchMentors(searchValue),
        searchCareers(searchValue),
        searchMajors(searchValue)
      ]);

      const combinedResults = [...(mentors || []), ...(careers || []), ...(majors || [])];
      console.log('Search results:', combinedResults);
      setSearchResults(combinedResults);
      
      if (session?.user?.id) {
        await trackSearch(value, combinedResults.length);
      }
    } catch (error) {
      console.error('Error in search:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchResults,
    isLoading,
    handleSearch
  };
};