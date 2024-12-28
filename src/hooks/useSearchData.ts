import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SearchResult, CareerSearchResult, MajorSearchResult, MentorSearchResult } from "@/types/search";

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      // Search careers
      const { data: careers, error: careersError } = await supabase
        .from('careers')
        .select('id, title, description, salary_range')
        .ilike('title', `%${searchTerm}%`);

      if (careersError) throw careersError;

      // Search majors
      const { data: majors, error: majorsError } = await supabase
        .from('majors')
        .select('id, title, description, degree_levels, career_opportunities, common_courses')
        .ilike('title', `%${searchTerm}%`);

      if (majorsError) throw majorsError;

      // Search mentors
      const { data: mentors, error: mentorsError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          bio,
          avatar_url,
          top_mentor,
          company:companies(name),
          school:schools(name),
          position:careers!profiles_position_fkey(title)
        `)
        .eq('user_type', 'mentor')
        .ilike('full_name', `%${searchTerm}%`);

      if (mentorsError) throw mentorsError;

      // Transform and combine results
      const results: SearchResult[] = [
        ...(careers?.map(career => ({
          id: career.id,
          title: career.title,
          description: career.description,
          type: 'career' as const,
          salary_range: career.salary_range
        })) || []),
        ...(majors?.map(major => ({
          id: major.id,
          title: major.title,
          description: major.description,
          type: 'major' as const,
          degree_levels: major.degree_levels,
          career_opportunities: major.career_opportunities,
          common_courses: major.common_courses
        })) || []),
        ...(mentors?.map(mentor => ({
          id: mentor.id,
          title: mentor.full_name,
          description: `${mentor.company?.name || ''} ${mentor.school?.name || ''} ${mentor.position?.title || ''}`.trim(),
          type: 'mentor' as const,
          avatar_url: mentor.avatar_url,
          position: mentor.position?.title || null,
          top_mentor: mentor.top_mentor || false
        })) || [])
      ];

      return results;
    },
    enabled: !!searchTerm,
  });
}