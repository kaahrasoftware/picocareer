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

      const [mentorsResponse, careersResponse, majorsResponse, blogsResponse] = await Promise.all([
        // Search mentors
        supabase
          .from('profiles')
          .select('id, full_name, position, company_name, avatar_url')
          .eq('user_type', 'mentor')
          .or(`full_name.ilike.%${query}%,position.ilike.%${query}%,company_name.ilike.%${query}%,skills.cs.{${query}}`)
          .limit(5),
        
        // Search careers
        supabase
          .from('careers')
          .select('id, title, description')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%, required_skills.cs.{${query}}, industry.ilike.%${query}%`)
          .limit(3),
        
        // Search majors
        supabase
          .from('majors')
          .select('id, title, description')
          .or(`title.ilike.%${query}%, description.ilike.%${query}%, field_of_study.ilike.%${query}%, required_courses.cs.{${query}}`)
          .limit(3),
        
        // Search blogs
        supabase
          .from('blogs')
          .select('id, title, summary')
          .or(`title.ilike.%${query}%, summary.ilike.%${query}%`)
          .limit(3)
      ]);

      const results: SearchResult[] = [
        ...(mentorsResponse.data?.map(mentor => ({
          id: mentor.id,
          title: mentor.full_name,
          description: `${mentor.position} at ${mentor.company_name}`,
          type: 'mentor' as const,
          avatar_url: mentor.avatar_url
        })) ?? []),
        ...(careersResponse.data?.map(career => ({
          id: career.id,
          title: career.title,
          description: career.description,
          type: 'career' as const
        })) ?? []),
        ...(majorsResponse.data?.map(major => ({
          id: major.id,
          title: major.title,
          description: major.description,
          type: 'major' as const
        })) ?? []),
        ...(blogsResponse.data?.map(blog => ({
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