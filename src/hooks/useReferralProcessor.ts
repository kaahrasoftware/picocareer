
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useReferralProcessor() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processReferralCode = async (referralCode: string) => {
    if (!referralCode) return { success: false, message: 'No referral code provided' };

    setIsProcessing(true);
    
    try {
      console.log('Processing referral code:', referralCode);
      
      const { data, error } = await supabase.functions.invoke('process-referral-code', {
        body: { referralCode }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (data?.success) {
        console.log('Referral processed successfully:', data);
        toast.success('🎉 Referral processed! Your friend has earned tokens!');
        
        // Clear referral code from localStorage
        localStorage.removeItem('referralCode');
        
        return { success: true, message: 'Referral processed successfully' };
      } else {
        console.log('Referral processing failed:', data?.message);
        toast.error(data?.message || 'Failed to process referral');
        return { success: false, message: data?.message || 'Failed to process referral' };
      }
    } catch (error: any) {
      console.error('Error processing referral:', error);
      const errorMessage = error.message || 'Failed to process referral code';
      toast.error(errorMessage);
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
