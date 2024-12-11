import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  type: 'career' | 'major' | 'mentor' | 'blog';
  description?: string;
  avatar_url?: string;
}

export const useSearchData = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.length <= 2) return [];

      console.log('Searching with query:', query);

      // Search mentors with expanded criteria
      const { data: mentors, error: mentorError } = await supabase
        .from('profiles')
        .select('id, full_name, position, company_name, avatar_url, bio')
        .eq('user_type', 'mentor')
        .or(`full_name.ilike.%${query}%,` +
            `position.ilike.%${query}%,` +
            `company_name.ilike.%${query}%,` +
            `bio.ilike.%${query}%,` +
            `location.ilike.%${query}%,` +
            `skills.cs.{${query}},` +
            `tools_used.cs.{${query}},` +
            `keywords.cs.{${query}},` +
            `fields_of_interest.cs.{${query}}`)
        .limit(5);

      if (mentorError) {
        console.error('Error fetching mentors:', mentorError);
        throw mentorError;
      }

      // Transform mentor results
      const mentorResults = (mentors || []).map(mentor => ({
        id: mentor.id,
        title: mentor.full_name || 'Unknown',
        description: `${mentor.position || 'Mentor'} at ${mentor.company_name || 'Company'}`,
        type: 'mentor' as const,
        avatar_url: mentor.avatar_url
      }));

      // Search careers
      const { data: careers } = await supabase
        .from('careers')
        .select('id, title, description')
        .or(`title.ilike.%${query}%,` + 
            `description.ilike.%${query}%,` + 
            `industry.ilike.%${query}%,` +
            `required_skills.cs.{${query}}`)
        .limit(3);

      // Search majors
      const { data: majors } = await supabase
        .from('majors')
        .select('id, title, description')
        .or(`title.ilike.%${query}%,` + 
            `description.ilike.%${query}%,` + 
            `field_of_study.ilike.%${query}%,` +
            `required_courses.cs.{${query}}`)
        .limit(3);

      // Search blogs
      const { data: blogs } = await supabase
        .from('blogs')
        .select('id, title, summary')
        .or(`title.ilike.%${query}%,` + 
            `summary.ilike.%${query}%`)
        .limit(3);

      const results: SearchResult[] = [
        ...mentorResults,
        ...(careers?.map(career => ({
          id: career.id,
          title: career.title,
          description: career.description,
          type: 'career' as const
        })) ?? []),
        ...(majors?.map(major => ({
          id: major.id,
          title: major.title,
          description: major.description,
          type: 'major' as const
        })) ?? []),
        ...(blogs?.map(blog => ({
          id: blog.id,
          title: blog.title,
          description: blog.summary,
          type: 'blog' as const
        })) ?? [])
      ];

      return results;
    },
    enabled: query.length > 2,
    staleTime: 1000 * 60 // Cache for 1 minute
  });
};