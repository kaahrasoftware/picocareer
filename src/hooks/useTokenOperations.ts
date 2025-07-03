
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DeductTokensParams {
  walletId: string;
  amount: number;
  description: string;
  category?: 'purchase' | 'session' | 'content' | 'refund' | 'adjustment' | 'bonus';
  referenceId?: string;
  metadata?: Record<string, any>;
}

interface RefundTokensParams {
  walletId: string;
  amount: number;
  description: string;
  referenceId?: string;
  metadata?: Record<string, any>;
}

interface TokenOperationResult {
  success: boolean;
  message: string;
  transaction_id?: string;
  new_balance?: number;
}

export function useTokenOperations() {
  const queryClient = useQueryClient();

  const deductTokens = useMutation({
    mutationFn: async (params: DeductTokensParams) => {
      console.log('🔄 Deducting tokens with corrected function:', params);
      
      const { data, error } = await supabase.rpc('deduct_tokens', {
        p_wallet_id: params.walletId,
        p_amount: params.amount,
        p_description: params.description,
        p_category: params.category || 'content',
        p_reference_id: params.referenceId || null,
        p_metadata: params.metadata || {}
      });

      if (error) {
        console.error('❌ Token deduction error:', error);
        throw error;
      }

      console.log('✅ Token deduction result:', data);
      return data as unknown as TokenOperationResult;
    },
    onSuccess: (data, variables) => {
      const result = data as TokenOperationResult;
      if (result.success) {
        console.log(`✅ Successfully deducted ${variables.amount} tokens`);
        toast.success(`${variables.amount} tokens used successfully`);
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } else {
        console.error('❌ Token deduction failed:', result.message);
        toast.error(result.message || 'Failed to use tokens');
      }
    },
    onError: (error) => {
      console.error('❌ Token deduction mutation failed:', error);
      toast.error('Failed to process token transaction');
    }
  });

  const refundTokens = useMutation({
    mutationFn: async (params: RefundTokensParams) => {
      console.log('🔄 Refunding tokens:', params);
      
      const { data, error } = await supabase.rpc('refund_tokens', {
        p_wallet_id: params.walletId,
        p_amount: params.amount,
        p_description: params.description,
        p_reference_id: params.referenceId || null,
        p_metadata: params.metadata || {}
      });

      if (error) {
        console.error('❌ Token refund error:', error);
        throw error;
      }

      console.log('✅ Token refund result:', data);
      return data as unknown as TokenOperationResult;
    },
    onSuccess: (data, variables) => {
      const result = data as TokenOperationResult;
      if (result.success) {
        console.log(`✅ Successfully refunded ${variables.amount} tokens`);
        toast.success(`${variables.amount} tokens refunded successfully`);
        queryClient.invalidateQueries({ queryKey: ['wallet'] });
        queryClient.invalidateQueries({ queryKey: ['transactions'] });
      } else {
        console.error('❌ Token refund failed:', result.message);
        toast.error(result.message || 'Failed to refund tokens');
      }
    },
    onError: (error) => {
      console.error('❌ Token refund mutation failed:', error);
      toast.error('Failed to process token refund');
    }
  });

  return {
    deductTokens,
    refundTokens
  };
}
