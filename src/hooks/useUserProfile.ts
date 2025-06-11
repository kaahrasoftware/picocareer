
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export function useUserProfile(session: Session | null) {
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          companies:company_id(name),
          schools:school_id(name),
          majors:academic_major_id(title)
        `)
        .eq('id', session.user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      // Transform the data to flatten related fields
      return {
        ...data,
        company_name: data.companies?.name || null,
        school_name: data.schools?.name || null,
        academic_major: data.majors?.title || null,
      };
    },
    enabled: !!session?.user?.id,
    retry: 1,
  });
}
