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
          .or(`title.ilike.%${query}%, description.ilike.%${query}%, required_skills.cs.{${query}}, industry.ilike.%${query}%`)
          .limit(5),
        supabase
          .from('majors')
          .select('id, title, description')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%, field_of_study.ilike.%${query}%, required_courses.cs.{${query}}`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, full_name, position, company_name, highest_degree, skills, tools_used')
          .eq('user_type', 'mentor')
          .or(`full_name.ilike.%${query}%, position.ilike.%${query}%, company_name.ilike.%${query}%, highest_degree.ilike.%${query}%, skills.cs.{${query}}, tools_used.cs.{${query}}`)
          .limit(5)
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
    initialData: [], // Always return an array
    staleTime: 1000, // Prevent too frequent refetches
    retry: false // Don't retry on failure to prevent unnecessary API calls
  });
};