
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TokenTransferParams {
  fromProfileId: string;
  toProfileId: string;
  amount: number;
  description: string;
}

export function useTokenTransferMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: TokenTransferParams) => {
      // Get both wallets
      const { data: wallets, error: walletsError } = await supabase
        .from('wallets')
        .select('id, profile_id, balance')
        .in('profile_id', [params.fromProfileId, params.toProfileId]);

      if (walletsError) throw walletsError;

      const fromWallet = wallets?.find(w => w.profile_id === params.fromProfileId);
      const toWallet = wallets?.find(w => w.profile_id === params.toProfileId);

      if (!fromWallet || !toWallet) {
        throw new Error('One or both user wallets not found');
      }

      // Check if from wallet has sufficient balance
      if (fromWallet.balance < params.amount) {
        throw new Error('Insufficient balance in source wallet');
      }

      // Deduct from source wallet
      const { data: deductResult, error: deductError } = await supabase.rpc('deduct_tokens', {
        p_wallet_id: fromWallet.id,
        p_amount: params.amount,
        p_description: `Transfer to user: ${params.description}`,
        p_category: 'adjustment',
        p_metadata: {
          admin_transfer: true,
          to_profile_id: params.toProfileId,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (deductError || !(deductResult as any)?.success) {
        throw new Error((deductResult as any)?.message || 'Failed to deduct tokens');
      }

      // Add to destination wallet
      const { data: addResult, error: addError } = await supabase.rpc('refund_tokens', {
        p_wallet_id: toWallet.id,
        p_amount: params.amount,
        p_description: `Transfer from user: ${params.description}`,
        p_metadata: {
          admin_transfer: true,
          from_profile_id: params.fromProfileId,
          admin_id: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (addError || !(addResult as any)?.success) {
        throw new Error((addResult as any)?.message || 'Failed to add tokens');
      }

      return { deductResult, addResult };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wallet-management'] });
      queryClient.invalidateQueries({ queryKey: ['token-economy-overview'] });
      toast.success('Tokens transferred successfully');
    },
    onError: (error: any) => {
      console.error('Failed to transfer tokens:', error);
      toast.error(error.message || 'Failed to transfer tokens');
    }
  });
}
