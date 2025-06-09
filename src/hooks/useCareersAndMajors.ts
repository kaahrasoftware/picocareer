
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useCareersAndMajors() {
  const { data: careers = [], isLoading: careersLoading } = useQuery({
    queryKey: ['careers-for-interests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('careers')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });

  const { data: majors = [], isLoading: majorsLoading } = useQuery({
    queryKey: ['majors-for-interests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('majors')
        .select('id, title')
        .eq('status', 'Approved')
        .order('title');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });

  return {
    careers,
    majors,
    isLoading: careersLoading || majorsLoading
  };
}
