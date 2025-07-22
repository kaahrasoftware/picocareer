
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AddTokensParams {
  profileId: string;
  amount: number;
  description: string;
  category: 'bonus' | 'adjustment' | 'refund' | 'content';
}

export function useAddTokensMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: AddTokensParams) => {
      // First, get or create the wallet for the user
      let { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('id')
        .eq('profile_id', params.profileId)
        .single();

      if (walletError && walletError.code === 'PGRST116') {
        // Wallet doesn't exist, create one
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({
            profile_id: params.profileId,
            balance: 0
          })
          .select('id')
          .single();

        if (createError) throw createError;
        wallet = newWallet;
      } else if (walletError) {
        throw walletError;
      }

      // Add tokens using the refund_tokens function (which adds tokens)
      const { data, error } = await supabase.rpc('refund_tokens', {
        p_wallet_id: wallet.id,
        p_amount: params.amount,
        p_description: params.description,
        p_metadata: {
          admin_action: true,
          category: params.category,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-management'] });
      queryClient.invalidateQueries({ queryKey: ['token-economy-overview'] });
      toast.success('Tokens added successfully');
    },
    onError: (error) => {
      console.error('Failed to add tokens:', error);
      toast.error('Failed to add tokens');
    }
  });
}
