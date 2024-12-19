import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult } from "@/types/search";

export type { SearchResult };

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!searchTerm) return [];

      const [majorsResponse, careersResponse, mentorsResponse] = await Promise.all([
        // Search majors
        supabase
          .from("majors")
          .select(`
            id,
            title,
            description,
            degree_levels,
            career_opportunities,
            common_courses
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5),

        // Search careers
        supabase
          .from("careers")
          .select(`
            id,
            title,
            description,
            salary_range
          `)
          .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
          .limit(5),

        // Search mentor profiles with expanded fields
        supabase
          .from("profiles")
          .select(`
            id,
            first_name,
            last_name,
            full_name,
            avatar_url,
            position,
            highest_degree,
            skills,
            tools_used,
            keywords,
            bio,
            location,
            fields_of_interest,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title)
          `)
          .eq('user_type', 'mentor')
          .or(
            `first_name.ilike.%${searchTerm}%,` +
            `last_name.ilike.%${searchTerm}%,` +
            `full_name.ilike.%${searchTerm}%,` +
            `position.ilike.%${searchTerm}%,` +
            `bio.ilike.%${searchTerm}%,` +
            `location.ilike.%${searchTerm}%`
          )
          // Filter for array fields using contains operator
          .or(`skills.cs.{${searchTerm}}`)
          .or(`tools_used.cs.{${searchTerm}}`)
          .or(`keywords.cs.{${searchTerm}}`)
          .or(`fields_of_interest.cs.{${searchTerm}}`)
          .limit(5)
      ]);

      // Handle any errors
      if (majorsResponse.error) throw majorsResponse.error;
      if (careersResponse.error) throw careersResponse.error;
      if (mentorsResponse.error) throw mentorsResponse.error;

      // Transform and combine results
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
        title: mentor.full_name || `${mentor.first_name} ${mentor.last_name}`.trim(),
        description: [
          mentor.position,
          mentor.highest_degree,
          mentor.location,
          mentor.company?.name,
          mentor.school?.name,
          mentor.academic_major?.title
        ].filter(Boolean).join(' • '),
        avatar_url: mentor.avatar_url,
        position: mentor.position,
        company_name: mentor.company?.name,
        skills: mentor.skills,
        tools: mentor.tools_used,
        keywords: mentor.keywords,
        fields_of_interest: mentor.fields_of_interest
      }));

      // Combine all results
      return [...majorResults, ...careerResults, ...mentorResults];
    },
    enabled: searchTerm.length > 2, // Only search when there are at least 3 characters
  });
}