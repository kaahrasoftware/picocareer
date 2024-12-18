import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Career } from "@/types/database/careers";

export function useFeaturedCareers() {
  return useQuery({
    queryKey: ['featured-careers'],
    queryFn: async () => {
      console.log('Fetching featured careers...');
      const { data, error } = await supabase
        .from('careers')
        .select(`
          id,
          title,
          description,
          salary_range,
          image_url,
          required_skills,
          required_tools,
          job_outlook,
          industry,
          work_environment
        `)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching featured careers:', error);
        throw error;
      }

      console.log('Featured careers fetched:', data?.length);
      return data as Career[];
    }
  });
}