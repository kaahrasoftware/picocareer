
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useDepartments(hubId: string) {
  return useQuery({
    queryKey: ['hub-departments', hubId],
    queryFn: async () => {
      if (!hubId) {
        throw new Error('Hub ID is required');
      }

      const { data, error } = await supabase
        .from('hub_departments')
        .select(`
          *,
          parent:parent_department_id(
            id,
            name
          )
        `)
        .eq('hub_id', hubId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!hubId,
  });
}
