
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useMentorTimezone(mentorId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['mentor-timezone', mentorId],
    queryFn: async () => {
      if (!mentorId) {
        throw new Error('No mentor ID provided');
      }

      console.log('Fetching timezone for mentor:', mentorId);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', mentorId)
        .eq('setting_type', 'timezone')
        .maybeSingle();

      if (error) {
        console.error('Error fetching mentor timezone:', error);
        toast({
          title: "Error",
          description: "Failed to load mentor's timezone. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      // If no timezone is set, return a default timezone
      if (!data?.setting_value) {
        console.warn('No timezone found for mentor:', mentorId);
        return 'UTC';
      }

      console.log('Mentor timezone fetched:', data.setting_value);
      return data.setting_value;
    },
    enabled: !!mentorId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
}
