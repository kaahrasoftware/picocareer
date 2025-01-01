import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@/types/database/profiles";

export function useUserProfile(session: Session | null) {
  return useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          *,
          academic_major:academic_major_id(title),
          school:school_id(name),
          company:company_id(name)
        `)
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      // Transform the nested objects into the expected format
      return {
        ...profile,
        academic_major: profile.academic_major?.title || null,
        school_name: profile.school?.name || null,
        company_name: profile.company?.name || null
      } as Profile;
    },
    enabled: !!session?.user?.id,
  });
}