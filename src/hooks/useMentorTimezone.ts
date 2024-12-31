import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useMentorTimezone(mentorId: string | undefined) {
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
        throw error;
      }

      const timezone = data?.setting_value || 'UTC';
      console.log('Mentor timezone fetched:', timezone);
      
      return timezone;
    },
    enabled: !!mentorId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}