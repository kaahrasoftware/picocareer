
import { useState } from 'react';
import { useTokenOperations } from './useTokenOperations';
import { useWalletBalance } from './useWalletBalance';
import { useBookSession } from './useBookSession';
import { MeetingPlatform } from '@/types/calendar';
import { toast } from 'sonner';

interface SessionPaymentParams {
  mentorId: string;
  mentorName: string;
  menteeName: string;
  formData: {
    date?: Date;
    selectedTime?: string;
    sessionType?: string;
    note: string;
    meetingPlatform: MeetingPlatform;
    menteePhoneNumber?: string;
    menteeTelegramUsername?: string;
  };
  onSuccess: () => void;
  onError: (error: any) => void;
}

interface DebugLog {
  step: string;
  timestamp: string;
  data: any;
  success: boolean;
  error?: string;
}

export function useSessionPaymentDebug() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugLogs, setDebugLogs] = useState<DebugLog[]>([]);
  const { deductTokens, refundTokens } = useTokenOperations();
  const { wallet, refreshBalance } = useWalletBalance();
  const bookSession = useBookSession();

  const addDebugLog = (step: string, data: any, success: boolean, error?: string) => {
    const log: DebugLog = {
      step,
      timestamp: new Date().toISOString(),
      data,
      success,
      error
    };
    console.log(`[TOKEN DEBUG] ${step}:`, log);
    setDebugLogs(prev => [...prev, log]);
  };

  const clearDebugLogs = () => {
    setDebugLogs([]);
  };

  const processPaymentAndBooking = async (params: SessionPaymentParams) => {
    const { mentorId, mentorName, menteeName, formData, onSuccess, onError } = params;
    
    clearDebugLogs();
    addDebugLog('PROCESS_START', { mentorId, mentorName, menteeName, formData }, true);
    
    // Step 1: Validate input parameters
    if (!formData.date || !formData.selectedTime || !formData.sessionType) {
      const error = new Error('Please select a date, time and session type');
      addDebugLog('VALIDATION_FAILED', { 
        date: formData.date, 
        selectedTime: formData.selectedTime, 
        sessionType: formData.sessionType 
      }, false, error.message);
      onError(error);
      return;
    }

    addDebugLog('VALIDATION_PASSED', { 
      date: formData.date, 
      selectedTime: formData.selectedTime, 
      sessionType: formData.sessionType 
    }, true);

    // Step 2: Check wallet existence
    if (!wallet) {
      const error = new Error('Wallet not found');
      addDebugLog('WALLET_CHECK_FAILED', { wallet }, false, error.message);
      onError(error);
      return;
    }

    addDebugLog('WALLET_CHECK_PASSED', { 
      walletId: wallet.id, 
      balance: wallet.balance,
      profileId: wallet.profile_id 
    }, true);

    // Step 3: Check balance
    if (wallet.balance < 25) {
      const error = new Error('Insufficient tokens. You need 25 tokens to book a session.');
      addDebugLog('BALANCE_CHECK_FAILED', { 
        currentBalance: wallet.balance, 
        required: 25 
      }, false, error.message);
      onError(error);
      return;
    }

    addDebugLog('BALANCE_CHECK_PASSED', { 
      currentBalance: wallet.balance, 
      required: 25,
      sufficient: true 
    }, true);

    setIsProcessing(true);
    let transactionId: string | null = null;

    try {
      addDebugLog('TOKEN_DEDUCTION_START', { 
        walletId: wallet.id, 
        amount: 25,
        description: `Session booking with ${mentorName}` 
      }, true);
      
      // Step 4: Deduct tokens first
      const tokenResult = await deductTokens.mutateAsync({
        walletId: wallet.id,
        amount: 25,
        description: `Session booking with ${mentorName}`,
        category: 'session',
        metadata: {
          mentor_name: mentorName,
          mentee_name: menteeName,
          session_date: formData.date.toISOString(),
          session_time: formData.selectedTime,
          meeting_platform: formData.meetingPlatform
        }
      });

      addDebugLog('TOKEN_DEDUCTION_RESULT', tokenResult, tokenResult.success);

      if (!tokenResult.success) {
        throw new Error(tokenResult.message || 'Failed to deduct tokens');
      }

      transactionId = tokenResult.transaction_id;
      addDebugLog('TOKEN_DEDUCTION_SUCCESS', { 
        transactionId, 
        newBalance: tokenResult.new_balance 
      }, true);

      // Refresh wallet balance immediately
      refreshBalance();

      addDebugLog('SESSION_BOOKING_START', {
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform
      }, true);
      
      // Step 5: Book the session
      const bookingResult = await bookSession({
        mentorId,
        date: formData.date,
        selectedTime: formData.selectedTime,
        sessionTypeId: formData.sessionType,
        note: formData.note,
        meetingPlatform: formData.meetingPlatform,
        menteePhoneNumber: formData.menteePhoneNumber,
        menteeTelegramUsername: formData.menteeTelegramUsername,
      });

      addDebugLog('SESSION_BOOKING_RESULT', bookingResult, bookingResult.success);

      if (!bookingResult.success) {
        addDebugLog('SESSION_BOOKING_FAILED_ROLLBACK_START', { 
          error: bookingResult.error,
          transactionId 
        }, false, bookingResult.error);
        
        // Rollback: Refund the tokens
        try {
          const refundResult = await refundTokens.mutateAsync({
            walletId: wallet.id,
            amount: 25,
            description: `Refund for failed session booking with ${mentorName}`,
            referenceId: transactionId,
            metadata: {
              original_transaction_id: transactionId,
              refund_reason: 'Session booking failed',
              mentor_name: mentorName
            }
          });
          
          addDebugLog('TOKEN_REFUND_RESULT', refundResult, refundResult.success);
          
          if (refundResult.success) {
            refreshBalance();
            addDebugLog('TOKEN_REFUND_SUCCESS', { newBalance: refundResult.new_balance }, true);
          }
          
        } catch (refundError) {
          addDebugLog('TOKEN_REFUND_FAILED', refundError, false, 'Failed to refund tokens');
          throw new Error('Session booking failed and token refund also failed. Please contact support.');
        }
        
        throw new Error(bookingResult.error || 'Failed to book session');
      }

      addDebugLog('SESSION_BOOKING_SUCCESS', { sessionId: bookingResult.sessionId }, true);
      addDebugLog('PROCESS_COMPLETE', { 
        sessionId: bookingResult.sessionId,
        transactionId,
        finalBalance: tokenResult.new_balance 
      }, true);

      toast.success(`Session booked successfully with ${mentorName}! 25 tokens have been deducted from your wallet.`);
      onSuccess();
      
    } catch (error: any) {
      addDebugLog('PROCESS_ERROR', error, false, error.message);
      
      // Provide specific error messages
      if (error.message.includes('Insufficient token balance')) {
        toast.error('Insufficient tokens. You need 25 tokens to book a session.');
      } else if (error.message.includes('Time slot is already booked')) {
        toast.error('This time slot is no longer available. Please select a different time.');
      } else if (error.message.includes('token')) {
        toast.error(error.message);
      } else {
        toast.error(error.message || 'Failed to book session. Please try again.');
      }
      
      onError(error);
    } finally {
      setIsProcessing(false);
      addDebugLog('PROCESS_END', { isProcessing: false }, true);
    }
  };

  return {
    processPaymentAndBooking,
    isProcessing,
    debugLogs,
    clearDebugLogs
  };
}
