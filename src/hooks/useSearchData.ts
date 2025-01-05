import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export type { SearchResult };

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      console.log('Starting search with term:', searchTerm);

      // Start with simpler queries to test basic functionality
      const [majorsResponse, careersResponse, mentorsResponse] = await Promise.all([
        // Search majors - simplified query
        supabase
          .from("majors")
          .select(`
            id,
            title,
            description,
            degree_levels,
            career_opportunities
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5),

        // Search careers - simplified query
        supabase
          .from("careers")
          .select(`
            id,
            title,
            description,
            salary_range
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .eq('complete_career', true)
          .limit(5),

        // Search mentor profiles - simplified query
        supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            position,
            location,
            company:companies(name),
            career:careers!profiles_position_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .limit(5)
      ]);

      // Log detailed responses
      console.log('Majors Response:', majorsResponse);
      console.log('Careers Response:', careersResponse);
      console.log('Mentors Response:', mentorsResponse);

      // Handle any errors
      if (majorsResponse.error) {
        console.error('Majors query error:', majorsResponse.error);
        throw majorsResponse.error;
      }
      if (careersResponse.error) {
        console.error('Careers query error:', careersResponse.error);
        throw careersResponse.error;
      }
      if (mentorsResponse.error) {
        console.error('Mentors query error:', mentorsResponse.error);
        throw mentorsResponse.error;
      }

      // Transform and combine results
      const majorResults: SearchResult[] = (majorsResponse.data || []).map(major => ({
        id: major.id,
        type: "major" as const,
        title: major.title,
        description: major.description,
        degree_levels: major.degree_levels,
        career_opportunities: major.career_opportunities
      }));

      const careerResults: SearchResult[] = (careersResponse.data || []).map(career => ({
        id: career.id,
        type: "career" as const,
        title: career.title,
        description: career.description,
        salary_range: career.salary_range
      }));

      const mentorResults: SearchResult[] = (mentorsResponse.data || []).map(mentor => ({
        id: mentor.id,
        type: "mentor" as const,
        title: `${mentor.first_name} ${mentor.last_name}`.trim(),
        description: mentor.career?.title || mentor.position,
        avatar_url: mentor.avatar_url,
        position: mentor.position,
        location: mentor.location,
        company: mentor.company
      }));

      const combinedResults = [...majorResults, ...careerResults, ...mentorResults];
      console.log('Combined search results:', combinedResults);

      return combinedResults;
    },
    enabled: searchTerm.length > 2, // Only search when there are at least 3 characters
  });
}