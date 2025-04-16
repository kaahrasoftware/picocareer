
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { OpportunityApplication } from "@/types/opportunity/types";

export function useUserApplications() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ['user-applications'],
    queryFn: async () => {
      if (!session?.user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          opportunities (
            id,
            title,
            provider_name,
            opportunity_type,
            deadline
          )
        `)
        .eq('profile_id', session.user.id)
        .order('applied_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching applications: ${error.message}`);
      }

      return data as OpportunityApplication[];
    },
    enabled: !!session?.user?.id,
  });
}
