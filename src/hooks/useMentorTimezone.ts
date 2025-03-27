
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

      // If no timezone is set, use UTC as fallback
      const timezone = settings?.setting_value || 'UTC';
      
      console.log('Mentor timezone found:', timezone);
      
      // Verify if timezone is valid
      try {
        // This will throw an error if timezone is invalid
        Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
        console.log('Profile timezone fetched:', timezone);
        return timezone;
      } catch (e) {
        console.error('Invalid timezone:', timezone, e);
        toast({
          title: "Warning",
          description: "Mentor's timezone appears to be invalid. Using UTC instead.",
          variant: "warning",
        });
        return 'UTC';
      }
    },
    enabled: !!profileId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    retry: 3,
  });
}
