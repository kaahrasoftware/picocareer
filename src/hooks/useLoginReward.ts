
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LoginRewardResult {
  success?: boolean;
  tokens_awarded?: number;
  already_claimed?: boolean;
  message?: string;
}

export function useLoginReward() {
  const [isProcessing, setIsProcessing] = useState(false);

  const processLoginReward = async (profileId: string) => {
    if (!profileId || isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Processing daily login reward for profile:', profileId);
      
      const { data, error } = await supabase.rpc('process_daily_login_reward', {
        p_profile_id: profileId
      });

      if (error) {
        console.error('Error processing login reward:', error);
        return;
      }

      console.log('Login reward result:', data);

      const result = data as LoginRewardResult;

      if (result?.success) {
        toast.success(`🎉 Daily login reward: ${result.tokens_awarded} tokens earned!`);
      } else if (result?.already_claimed) {
        // Don't show toast for already claimed - this is normal behavior
        console.log('Daily reward already claimed today');
      } else {
        console.error('Login reward failed:', result?.message);
      }
      
    } catch (error: any) {
      console.error('Error processing login reward:', error);
      // Don't show error toast to avoid annoying users during normal login
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processLoginReward,
    isProcessing
  };
}
