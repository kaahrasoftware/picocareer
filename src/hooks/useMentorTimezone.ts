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
        .single();

      if (error) {
        console.error('Error fetching mentor timezone:', error);
        toast({
          title: "Error",
          description: "Failed to load mentor's timezone. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      if (!data?.setting_value) {
        console.error('No timezone found for mentor:', mentorId);
        toast({
          title: "Warning",
          description: "Mentor's timezone is not set",
          variant: "destructive",
        });
        throw new Error('Mentor timezone not found');
      }

      console.log('Mentor timezone fetched:', data.setting_value);
      return data.setting_value;
    },
    enabled: !!mentorId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
}