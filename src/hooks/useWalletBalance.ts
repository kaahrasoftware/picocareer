
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "./useAuthSession";

export function useWalletBalance() {
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ['wallet', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('profile_id', session.user.id)
        .single();

      if (error) {
        // If no wallet exists, create one
        if (error.code === 'PGRST116') {
          const { data: newWallet, error: createError } = await supabase
            .from('wallets')
            .insert({
              profile_id: session.user.id,
              balance: 0
            })
            .select()
            .single();

          if (createError) throw createError;
          return newWallet;
        }
        throw error;
      }

      return data;
    },
    enabled: !!session?.user?.id
  });

  const refreshBalance = () => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  };

  return {
    wallet,
    balance: wallet?.balance || 0,
    isLoading,
    error,
    refreshBalance
  };
}
