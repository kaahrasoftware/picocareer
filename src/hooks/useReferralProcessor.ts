
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useReferralProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processReferralCode = async (referralCode: string) => {
    if (!referralCode) return { success: false, message: 'No referral code provided' };

    // Clean and normalize the referral code
    const cleanCode = referralCode.trim().toUpperCase();
    setIsProcessing(true);
    
    try {
      console.log('Processing referral code:', cleanCode);
      
      const { data, error } = await supabase.functions.invoke('process-referral-code', {
        body: { referralCode: cleanCode }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast.error('Failed to process referral code. Please try again.');
        return { success: false, message: error.message || 'Failed to process referral code' };
      }

      console.log('Function response:', data);

      if (data?.success) {
        console.log('Referral processed successfully:', data);
        toast.success('🎉 Referral processed! You and your friend have both earned 15 tokens!');
        
        // Clear referral code from localStorage if it exists
        localStorage.removeItem('referralCode');
        
        return { success: true, message: 'Referral processed successfully' };
      } else {
        console.log('Referral processing failed:', data?.message);
        const errorMessage = data?.message || 'Failed to process referral';
        
        // Provide more specific error messages
        if (errorMessage.includes('already been referred')) {
          toast.error('You have already been referred by someone else.');
        } else if (errorMessage.includes('Invalid or inactive')) {
          toast.error('This referral code is invalid or has expired. Please check the code and try again.');
        } else if (errorMessage.includes('cannot refer yourself')) {
          toast.error('You cannot use your own referral code.');
        } else {
          toast.error(errorMessage);
        }
        
        return { success: false, message: errorMessage };
      }
    } catch (error: any) {
      console.error('Error processing referral:', error);
      const errorMessage = error.message || 'Failed to process referral code';
      toast.error('An unexpected error occurred. Please try again.');
      return { success: false, message: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processReferralCode,
    isProcessing
  };
}
