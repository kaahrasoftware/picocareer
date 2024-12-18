import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      // Search majors
      const { data: majors, error: majorsError } = await supabase
        .from("majors")
        .select(`
          id,
          title,
          description,
          degree_levels,
          career_opportunities,
          common_courses,
          potential_salary
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .limit(5);

      if (majorsError) {
        console.error("Error searching majors:", majorsError);
        throw majorsError;
      }

      // Search careers
      const { data: careers, error: careersError } = await supabase
        .from("careers")
        .select(`
          id,
          title,
          description,
          salary_range,
          industry
        `)
        .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,industry.ilike.%${searchTerm}%`)
        .limit(5);

      if (careersError) {
        console.error("Error searching careers:", careersError);
        throw careersError;
      }

      // Search mentors (profiles)
      const { data: mentors, error: mentorsError } = await supabase
        .from("profiles")
        .select(`
          id,
          full_name,
          avatar_url,
          position,
          bio,
          skills,
          company:company_id(name),
          school:school_id(name)
        `)
        .eq('user_type', 'mentor')
        .or(`
          full_name.ilike.%${searchTerm}%,
          position.ilike.%${searchTerm}%,
          bio.ilike.%${searchTerm}%,
          skills.cs.{${searchTerm}}
        `)
        .limit(5);

      if (mentorsError) {
        console.error("Error searching mentors:", mentorsError);
        throw mentorsError;
      }

      // Transform and combine results
      const majorResults: SearchResult[] = (majors || []).map(major => ({
        id: major.id,
        type: "major" as const,
        title: major.title,
        description: major.description,
        degree_levels: major.degree_levels,
        career_opportunities: major.career_opportunities,
        common_courses: major.common_courses
      }));

      const careerResults: SearchResult[] = (careers || []).map(career => ({
        id: career.id,
        type: "career" as const,
        title: career.title,
        description: career.description,
        salary_range: career.salary_range
      }));

      const mentorResults: SearchResult[] = (mentors || []).map(mentor => ({
        id: mentor.id,
        type: "mentor" as const,
        title: mentor.full_name || '',
        description: mentor.position || '',
        avatar_url: mentor.avatar_url,
        position: mentor.position,
        company_name: mentor.company?.name,
        school_name: mentor.school?.name
      }));

      // Combine all results
      return [...majorResults, ...careerResults, ...mentorResults];
    },
    enabled: searchTerm.length > 2, // Only search when there are at least 3 characters
  });
}