
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MenteeCourse } from '@/types/mentee-profile';

export function useAllMenteeCourses(menteeId: string) {
  return useQuery({
    queryKey: ['all-mentee-courses', menteeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mentee_courses')
        .select('*')
        .eq('mentee_id', menteeId)
        .order('year', { ascending: false })
        .order('semester', { ascending: false })
        .order('course_name', { ascending: true });
      
      if (error) throw error;
      
      return (data || []) as MenteeCourse[];
    },
    enabled: !!menteeId,
  });
}
