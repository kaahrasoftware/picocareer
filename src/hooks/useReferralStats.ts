
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "./useAuthSession";

export function useReferralStats() {
  const { session } = useAuthSession();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['referralStats', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      // Get referral statistics
      const [referralsResponse, rewardsResponse] = await Promise.all([
        supabase
          .from('user_referrals')
          .select(`
            *,
            referred:profiles!user_referrals_referred_id_fkey(
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('referrer_id', session.user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false }),
        
        supabase
          .from('referral_rewards')
          .select('*')
          .eq('referrer_id', session.user.id)
          .order('awarded_at', { ascending: false })
      ]);

      if (referralsResponse.error) throw referralsResponse.error;
      if (rewardsResponse.error) throw rewardsResponse.error;

      const referrals = referralsResponse.data || [];
      const rewards = rewardsResponse.data || [];

      const totalReferrals = referrals.length;
      const totalTokensEarned = rewards.reduce((sum, reward) => sum + reward.reward_amount, 0);

      return {
        totalReferrals,
        totalTokensEarned,
        referrals,
        rewards,
        recentReferrals: referrals.slice(0, 5)
      };
    },
    enabled: !!session?.user?.id
  });

  return {
    stats,
    isLoading,
    error
  };
}
