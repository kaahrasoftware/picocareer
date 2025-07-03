
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
        .select('id') // Select only available fields since timezone doesn't exist
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching mentor profile:', error);
        // Fix: Use valid toast variant
        toast({
          title: "Warning",
          description: "Could not fetch mentor profile information",
          variant: "destructive", // Changed from "warning" to "destructive"
        });
        return null;
      }

      // Return UTC as default since timezone field doesn't exist in the database
      return 'UTC';
    },
    enabled: !!profileId,
  });
}
