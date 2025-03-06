
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export function useConfigCheck() {
  const { toast } = useToast();
  const [configChecked, setConfigChecked] = useState(false);
  const [hasConfigError, setHasConfigError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
            title: "API Configuration Issue",
            description: "There was a problem with the chat configuration. Please try again later.",
            variant: "destructive",
            duration: 10000
          });
          setHasConfigError(true);
        } else {
          setConfigChecked(true);
          setHasConfigError(false);
        }
      } catch (error) {
        console.error('Failed to check API configuration:', error);
        toast({
          title: "Configuration Check Failed",
          description: "Could not verify the chat API configuration.",
          variant: "destructive",
          duration: 5000
        });
        setHasConfigError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkApiConfig();
  }, [toast]);

  return { configChecked, hasConfigError, isLoading };
}
