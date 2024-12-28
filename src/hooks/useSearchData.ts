import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  id: string;
  title?: string;
  name?: string;
  description?: string;
  type: 'career' | 'major' | 'mentor';
}

interface Company {
  id: string;
  name: string;
}

interface School {
  id: string;
  name: string;
}

interface Career {
  id: string;
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
          description: `${(mentor.company as Company[])[0]?.name || ''} ${
            (mentor.school as School[])[0]?.name || ''
          } ${(mentor.position as Career[])[0]?.title || ''}`.trim(),
          type: 'mentor' as const
        })) || [])
      ];

      return results;
    },
    enabled: !!searchTerm,
  });
}