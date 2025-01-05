import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      console.log('Starting search with term:', searchTerm);

      // Start with very basic queries to test functionality
      const [majorsResponse, careersResponse, mentorsResponse] = await Promise.all([
        // Search majors - basic title search
        supabase
          .from("majors")
          .select('id, title, description, degree_levels, career_opportunities, common_courses')
          .ilike('title', `%${searchTerm}%`),

        // Search careers - basic title search
        supabase
          .from("careers")
          .select('id, title, description, salary_range')
          .ilike('title', `%${searchTerm}%`),

        // Search mentor profiles - basic name search
        supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            avatar_url,
            position,
            location,
            top_mentor,
            company:companies(name)
          `)
          .eq('user_type', 'mentor')
          .ilike('full_name', `%${searchTerm}%`)
      ]);

      // Log raw responses for debugging
      console.log('Raw responses:', {
        majors: majorsResponse,
        careers: careersResponse,
        mentors: mentorsResponse
      });

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

      // Transform results
      const majorResults: SearchResult[] = (majorsResponse.data || []).map(major => ({
        id: major.id,
        type: "major" as const,
        title: major.title,
        description: major.description,
        degree_levels: major.degree_levels,
        career_opportunities: major.career_opportunities,
        common_courses: major.common_courses
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
        description: mentor.position || 'Mentor',
        avatar_url: mentor.avatar_url,
        position: mentor.position,
        location: mentor.location,
        company: mentor.company?.name,
        top_mentor: mentor.top_mentor
      }));

      const combinedResults = [...majorResults, ...careerResults, ...mentorResults];
      console.log('Combined search results:', combinedResults);

      return combinedResults;
    },
    enabled: searchTerm.length > 2,
  });
}