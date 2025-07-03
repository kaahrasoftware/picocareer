
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useMentorTimezone(profileId?: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['mentor-timezone', profileId],
    queryFn: async () => {
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('timezone')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching mentor timezone:', error);
        // Fix: Use valid toast variant
        toast({
          title: "Warning",
          description: "Could not fetch mentor timezone information",
          variant: "destructive", // Changed from "warning" to "destructive"
        });
        return null;
      }

      return data?.timezone || 'UTC';
    },
    enabled: !!profileId,
  });
}
