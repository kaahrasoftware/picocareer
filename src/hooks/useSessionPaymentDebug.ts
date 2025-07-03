
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentRequest {
  sessionId: string;
  tokenCost: number;
  description: string;
}

interface PaymentResult {
  success: boolean;
  message: string;
  transaction_id?: string;
}

export function useSessionPaymentDebug() {
  const processPayment = useMutation({
    mutationFn: async ({ sessionId, tokenCost, description }: PaymentRequest): Promise<PaymentResult> => {
      try {
        console.log('DEBUG: Processing payment for session:', sessionId, 'Cost:', tokenCost);
        
        // Get current user's wallet
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          console.log('DEBUG: User authentication failed:', userError);
          throw new Error('User not authenticated');
        }

        console.log('DEBUG: User authenticated:', user.id);

        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', user.id)
          .single();

        console.log('DEBUG: Wallet query result:', { wallet, walletError });

        if (walletError) {
          console.error('DEBUG: Wallet error:', walletError);
          throw new Error('Failed to retrieve wallet information');
        }

        if (!wallet) {
          console.log('DEBUG: No wallet found for user');
          throw new Error('Wallet not found');
        }

        console.log('DEBUG: Current wallet balance:', wallet.balance, 'Required:', tokenCost);

        if (wallet.balance < tokenCost) {
          const insufficientMessage = `Insufficient balance. You have ${wallet.balance} tokens but need ${tokenCost} tokens.`;
          console.log('DEBUG:', insufficientMessage);
          return {
            success: false,
            message: insufficientMessage
          };
        }

        console.log('DEBUG: Calling deduct_tokens function...');

        // Call the deduct_tokens function
        const { data: result, error: deductError } = await supabase
          .rpc('deduct_tokens', {
            p_wallet_id: wallet.id,
            p_amount: tokenCost,
            p_description: description,
            p_category: 'session' as any,
            p_reference_id: sessionId,
            p_metadata: { session_id: sessionId }
          });

        console.log('DEBUG: Deduct tokens result:', result);
        console.log('DEBUG: Deduct tokens error:', deductError);

        if (deductError) {
          console.error('DEBUG: Error deducting tokens:', deductError);
          throw new Error(`Payment failed: ${deductError.message}`);
        }

        // Parse the result as it comes back as JSONB
        const parsedResult = result as PaymentResult & { transaction_id?: string };
        
        console.log('DEBUG: Parsed result:', parsedResult);

        if (parsedResult.success) {
          const successMessage = parsedResult.message || 'Payment completed successfully';
          console.log('DEBUG: Payment successful:', successMessage);
          toast.success(`Payment successful! ${successMessage}`);
          return {
            success: true,
            message: successMessage,
            transaction_id: parsedResult.transaction_id
          };
        } else {
          const failureMessage = parsedResult.message || 'Payment failed';
          console.log('DEBUG: Payment failed:', failureMessage);
          toast.error(failureMessage);
          return {
            success: false,
            message: failureMessage
          };
        }

      } catch (error) {
        console.error('DEBUG: Payment processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';
        toast.error(`Payment failed: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage
        };
      }
    },
    onError: (error) => {
      console.error('DEBUG: Payment mutation error:', error);
      toast.error('Payment processing failed');
    }
  });

  return {
    processPayment,
    isProcessingPayment: processPayment.isPending,
  };
}
