
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "./useAuthSession";

export function useReferralCode() {
  const { session } = useAuthSession();

  return useQuery({
    queryKey: ['referralCode', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      const { data, error } = await supabase
        .from('referral_codes')
        .select('referral_code')
        .eq('profile_id', session.user.id)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data?.referral_code || null;
    },
    enabled: !!session?.user?.id
  });
}
