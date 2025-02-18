
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useMentorTimezone(profileId: string | undefined) {
  const { toast } = useToast();

  return useQuery({
    queryKey: ['profile-timezone', profileId],
    queryFn: async () => {
      if (!profileId) {
        throw new Error('No profile ID provided');
      }

      console.log('Fetching timezone for profile:', profileId);
      
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('setting_value')
        .eq('profile_id', profileId)
        .eq('setting_type', 'timezone')
        .maybeSingle();

      if (error) {
        console.error('Error fetching profile timezone:', error);
        toast({
          title: "Error",
          description: "Failed to load timezone. Please try again.",
          variant: "destructive",
        });
        throw error;
      }

      const timezone = settings?.setting_value || 'UTC';
      console.log('Profile timezone fetched:', timezone);
      return timezone;
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
}
