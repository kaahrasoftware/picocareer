
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useApiConfig(
  sessionId: string | null,
  setHasConfigError: (hasError: boolean) => void,
  isLoading: boolean, 
  messagesLength: number,
  configChecked: boolean,
  setConfigChecked: (checked: boolean) => void
) {
  useEffect(() => {
    const checkApiConfig = async () => {
      if (!sessionId) return;
      
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: { type: 'config-check' }
        });
        
        if (response.error || response.data?.error) {
          console.warn('DeepSeek API configuration issue:', response.error || response.data?.error);
          setHasConfigError(true);
        } else {
          setHasConfigError(false);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
      }
    };
    
    checkApiConfig();
  }, [sessionId, setHasConfigError]);

  useEffect(() => {
    const checkApiConfig = async () => {
      try {
        const response = await supabase.functions.invoke('career-chat-ai', {
          body: {
            type: 'config-check'
          }
        });
        if (response.error || response.data?.error) {
          toast({
            title: "DeepSeek API Key Not Configured",
            description: "Please contact an administrator to set up the DeepSeek integration.",
            variant: "destructive",
            duration: 10000
          });
        } else {
          setConfigChecked(true);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
        toast({
          title: "Configuration Check Failed",
          description: "Could not verify the DeepSeek API configuration.",
          variant: "destructive",
          duration: 5000
        });
      }
    };
    if (!isLoading && messagesLength <= 2 && !configChecked) {
      checkApiConfig();
    }
  }, [isLoading, messagesLength, configChecked, setConfigChecked]);
}
