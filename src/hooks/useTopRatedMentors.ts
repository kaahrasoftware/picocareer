import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/types/database/profiles";

export function useTopRatedMentors(page = 1, limit = 6) {
  return useQuery({
    queryKey: ['top-rated-mentors', page, limit],
    queryFn: async () => {
      console.log('Fetching top rated mentors...');
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          avatar_url,
          position,
          bio,
          skills,
          tools_used,
          company:companies(name),
          school:schools(name),
          academic_major:majors!profiles_academic_major_id_fkey(title)
        `, { count: 'exact' })
        .eq('user_type', 'mentor')
        .eq('top_mentor', true)
        .order('created_at', { ascending: false })
        .range(start, end);

      if (error) {
        console.error('Error fetching top rated mentors:', error);
        throw error;
      }

      console.log('Top rated mentors fetched:', data?.length, 'Total:', count);
      return {
        mentors: data.map(profile => ({
          ...profile,
          company_name: profile.company?.name,
          school_name: profile.school?.name,
          academic_major: profile.academic_major?.title || null
        })) as Profile[],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      };
    }
  });
}