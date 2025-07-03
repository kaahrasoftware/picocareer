
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

interface BookingFormData {
  date?: Date;
  selectedTime?: string;
  sessionType?: string;
  note: string;
  meetingPlatform: string;
  menteePhoneNumber?: string;
  menteeTelegramUsername?: string;
}

interface ProcessPaymentAndBookingRequest {
  mentorId: string;
  mentorName: string;
  menteeName: string;
  formData: BookingFormData;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function useSessionPayment() {
  const processPayment = useMutation({
    mutationFn: async ({ sessionId, tokenCost, description }: PaymentRequest): Promise<PaymentResult> => {
      try {
        console.log('Processing payment for session:', sessionId, 'Cost:', tokenCost);
        
        // Get current user's wallet
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('id, balance')
          .eq('profile_id', user.id)
          .single();

        if (walletError) {
          console.error('Wallet error:', walletError);
          throw new Error('Failed to retrieve wallet information');
        }

        if (!wallet) {
          throw new Error('Wallet not found');
        }

        if (wallet.balance < tokenCost) {
          return {
            success: false,
            message: `Insufficient balance. You have ${wallet.balance} tokens but need ${tokenCost} tokens.`
          };
        }

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

        console.log('Deduct tokens result:', result);

        if (deductError) {
          console.error('Error deducting tokens:', deductError);
          throw new Error(`Payment failed: ${deductError.message}`);
        }

        // Parse the result as it comes back as JSONB
        const parsedResult = result as unknown as PaymentResult & { transaction_id?: string };
        
        if (parsedResult.success) {
          toast.success(`Payment successful! ${parsedResult.message || 'Tokens deducted successfully'}`);
          return {
            success: true,
            message: parsedResult.message || 'Payment completed successfully',
            transaction_id: parsedResult.transaction_id
          };
        } else {
          toast.error(parsedResult.message || 'Payment failed');
          return {
            success: false,
            message: parsedResult.message || 'Payment failed'
          };
        }

      } catch (error) {
        console.error('Payment processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown payment error';
        toast.error(`Payment failed: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage
        };
      }
    },
    onError: (error) => {
      console.error('Payment mutation error:', error);
      toast.error('Payment processing failed');
    }
  });

  const refundPayment = useMutation({
    mutationFn: async ({ sessionId, tokenCost, description }: PaymentRequest): Promise<PaymentResult> => {
      try {
        console.log('Processing refund for session:', sessionId, 'Amount:', tokenCost);
        
        // Get current user's wallet
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error('User not authenticated');
        }

        const { data: wallet, error: walletError } = await supabase
          .from('wallets')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (walletError || !wallet) {
          throw new Error('Failed to retrieve wallet information');
        }

        // Call the refund_tokens function
        const { data: result, error: refundError } = await supabase
          .rpc('refund_tokens', {
            p_wallet_id: wallet.id,
            p_amount: tokenCost,
            p_description: description,
            p_reference_id: sessionId,
            p_metadata: { session_id: sessionId }
          });

        if (refundError) {
          console.error('Error refunding tokens:', refundError);
          throw new Error(`Refund failed: ${refundError.message}`);
        }

        // Parse the result as it comes back as JSONB
        const parsedResult = result as unknown as PaymentResult;
        
        if (parsedResult.success) {
          toast.success(`Refund successful! ${parsedResult.message || 'Tokens refunded successfully'}`);
          return {
            success: true,
            message: parsedResult.message || 'Refund completed successfully'
          };
        } else {
          toast.error(parsedResult.message || 'Refund failed');
          return {
            success: false,
            message: parsedResult.message || 'Refund failed'
          };
        }

      } catch (error) {
        console.error('Refund processing error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown refund error';
        toast.error(`Refund failed: ${errorMessage}`);
        return {
          success: false,
          message: errorMessage
        };
      }
    },
    onError: (error) => {
      console.error('Refund mutation error:', error);
      toast.error('Refund processing failed');
    }
  });

  const processPaymentAndBooking = async ({
    mentorId,
    mentorName,
    menteeName,
    formData,
    onSuccess,
    onError
  }: ProcessPaymentAndBookingRequest) => {
    try {
      // Simulate the booking process - in real implementation this would integrate with booking logic
      console.log('Processing payment and booking for:', { mentorId, mentorName, menteeName, formData });
      
      // For now, just call onSuccess - this would need to be implemented properly
      // with actual booking creation logic
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      onError(errorMessage);
    }
  };

  return {
    processPayment,
    refundPayment,
    processPaymentAndBooking,
    isProcessingPayment: processPayment.isPending,
    isProcessingRefund: refundPayment.isPending,
  };
}
