import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  id: string;
  title: string;
  type: 'career' | 'major' | 'mentor';
  description?: string;
}

export const useSearchData = (query: string) => {
  return useQuery({
    queryKey: ['search', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query) return [];

      const [careersResponse, majorsResponse, mentorsResponse] = await Promise.all([
        supabase
          .from('careers')
          .select('id, title, description')
          .ilike('title', `%${query}%`),
        supabase
          .from('majors')
          .select('id, title, description')
          .ilike('title', `%${query}%`),
        supabase
          .from('profiles')
          .select('id, full_name, position, company_name')
          .eq('user_type', 'mentor')
          .ilike('full_name', `%${query}%`)
      ]);

      const results: SearchResult[] = [
        ...(careersResponse.data?.map(career => ({
          id: career.id,
          title: career.title,
          description: career.description,
          type: 'career' as const
        })) || []),
        ...(majorsResponse.data?.map(major => ({
          id: major.id,
          title: major.title,
          description: major.description,
          type: 'major' as const
        })) || []),
        ...(mentorsResponse.data?.map(mentor => ({
          id: mentor.id,
          title: mentor.position || 'Mentor',
          description: `${mentor.full_name} at ${mentor.company_name}`,
          type: 'mentor' as const
        })) || [])
      ];

      return results;
    },
    enabled: query.length > 0,
    initialData: [] // Provide initial data to prevent undefined
  });
};