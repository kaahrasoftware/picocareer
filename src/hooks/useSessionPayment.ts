
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useBookSession } from "./useBookSession";

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
  const bookSession = useBookSession();

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
      console.log('🚀 Starting complete payment and booking process...', {
        mentorId,
        mentorName,
        menteeName,
        formData
      });

      // Validate required fields
      if (!formData.date || !formData.selectedTime || !formData.sessionType) {
        throw new Error('Missing required booking information');
      }

      // Step 1: Create the session booking first
      console.log('📅 Creating session booking...');
      const sessionResult = await bookSession({
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform as any,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      if (!sessionResult.success || !sessionResult.sessionId) {
        throw new Error(sessionResult.error || 'Failed to create session booking');
      }

      console.log('✅ Session created successfully:', sessionResult.sessionId);

      // Step 2: Process the token payment
      console.log('💳 Processing token payment...');
      const paymentResult = await processPayment.mutateAsync({
        sessionId: sessionResult.sessionId,
        tokenCost: 25, // Standard session cost
        description: `Session booking with ${mentorName}`
      });

      if (!paymentResult.success) {
        // Payment failed, we should rollback the session
        console.error('❌ Payment failed, cleaning up session...');
        try {
          // Delete the created session since payment failed
          await supabase
            .from('mentor_sessions')
            .delete()
            .eq('id', sessionResult.sessionId);
          console.log('🧹 Session cleaned up after payment failure');
        } catch (cleanupError) {
          console.error('Failed to cleanup session after payment failure:', cleanupError);
        }
        
        throw new Error(paymentResult.message);
      }

      console.log('✅ Payment processed successfully');

      // Step 3: Handle additional integrations (meeting links, notifications)
      try {
        // Create Google Meet link if needed
        if (formData.meetingPlatform === 'Google Meet') {
          console.log('🔗 Creating Google Meet link...');
          const { data: meetData, error: meetError } = await supabase.functions.invoke('create-meet-link', {
            body: { sessionId: sessionResult.sessionId }
          });

          if (meetError) {
            console.error('Meet link error:', meetError);
            toast.error('Session booked successfully, but there was an issue creating the Google Meet link.');
          } else if (meetData?.meetLink) {
            // Update session with meet link
            await supabase
              .from('mentor_sessions')
              .update({ meeting_link: meetData.meetLink })
              .eq('id', sessionResult.sessionId);
            console.log('✅ Google Meet link created and saved');
          }
        }

        // Send notifications and emails
        console.log('📧 Sending notifications...');
        await Promise.all([
          supabase.functions.invoke('schedule-session-notifications', {
            body: { sessionId: sessionResult.sessionId }
          }),
          supabase.functions.invoke('send-session-email', {
            body: { 
              sessionId: sessionResult.sessionId,
              type: 'confirmation'
            }
          })
        ]);
        console.log('✅ Notifications sent');

      } catch (integrationError) {
        console.error('Integration error (non-blocking):', integrationError);
        toast.error('Session booked successfully, but there was an issue with additional services.');
      }

      // Success!
      console.log('🎉 Complete booking process finished successfully');
      toast.success('Session booked successfully! Check your email for confirmation details.');
      onSuccess();

    } catch (error: any) {
      console.error('💥 Booking process failed:', error);
      const errorMessage = error.message || 'Failed to complete booking';
      toast.error(`Booking failed: ${errorMessage}`);
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
