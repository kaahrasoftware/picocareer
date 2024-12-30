import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useUserProfile(session: Session | null) {
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) {
        console.log('No authenticated session, skipping profile fetch');
        return null;
      }

      try {
        console.log('Fetching profile for user:', session.user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            *,
            company:companies(name),
            school:schools(name),
            academic_major:majors!profiles_academic_major_id_fkey(title),
            career:careers!profiles_position_fkey(title, id)
          `)
          .eq('id', session.user.id)
          .maybeSingle();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        throw error;
      }
    },
    enabled: !!session?.user?.id,
  });
}