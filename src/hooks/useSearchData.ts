import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SearchResult } from "@/types/search";

interface Company {
  name: string;
}

interface School {
  name: string;
}

interface Career {
  title: string;
}

export function useSearchData(searchTerm: string) {
  return useQuery({
    queryKey: ['search', searchTerm],
    queryFn: async () => {
      if (!searchTerm) return [];

      // Search careers
      const { data: careers, error: careersError } = await supabase
        .from('careers')
        .select('id, title, description')
        .ilike('title', `%${searchTerm}%`);

      if (careersError) throw careersError;

      // Search majors
      const { data: majors, error: majorsError } = await supabase
        .from('majors')
        .select('id, title, description')
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
          company:companies!inner(name),
          school:schools!inner(name),
          position:careers!inner(title)
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
          type: 'career' as const
        })) || []),
        ...(majors?.map(major => ({
          id: major.id,
          title: major.title,
          description: major.description,
          type: 'major' as const
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
