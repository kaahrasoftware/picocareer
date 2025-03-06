
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useApiConfig() {
  const [hasConfigError, setHasConfigError] = useState(false);

  const checkApiConfig = (sessionId: string | null) => {
    useEffect(() => {
      const checkConfiguration = async () => {
        if (!sessionId) return;
        
        try {
          const response = await supabase.functions.invoke('career-chat-ai', {
            body: { type: 'config-check' }
          });
          
          if (response.error || response.data?.error) {
            console.warn('DeepSeek API configuration issue:', response.error || response.data?.error);
            setHasConfigError(true);
            
            toast.error("API Configuration Issue", {
              description: "There was a problem with the chat configuration. Please try again later."
            });
          } else {
            setHasConfigError(false);
          }
        } catch (error) {
          console.error('Failed to check API configuration:', error);
          setHasConfigError(true);
          
          toast.error("Configuration Check Failed", {
            description: "Could not verify the chat API configuration."
          });
        }
      };
      
      checkConfiguration();
    }, [sessionId]);
    
    return hasConfigError;
  };

  return {
    checkApiConfig,
    hasConfigError
  };
}
