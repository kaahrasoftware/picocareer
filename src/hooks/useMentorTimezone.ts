
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";

export function useMentorTimezone(profileId: string | undefined) {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: currentUserProfile } = useUserProfile(session);
  const isAdmin = currentUserProfile?.user_type === 'admin';
  const isCurrentUser = profileId === session?.user?.id;

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

// Add a separate function for updating timezones
export function useUpdateTimezone() {
  const { toast } = useToast();
  const { session } = useAuthSession();
  const { data: currentUserProfile } = useUserProfile(session);
  const isAdmin = currentUserProfile?.user_type === 'admin';

  const updateTimezone = async (profileId: string, timezone: string) => {
    if (!profileId) {
      toast({
        title: "Error",
        description: "No profile ID provided for timezone update",
        variant: "destructive",
      });
      return false;
    }

    if (!session) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update settings",
        variant: "destructive",
      });
      return false;
    }

    // Only allow updates if user is updating their own timezone or is an admin
    if (!isAdmin && profileId !== session.user.id) {
      toast({
        title: "Permission denied",
        description: "You can only update your own timezone settings",
        variant: "destructive",
      });
      return false;
    }

    console.log(`Updating timezone for profile ${profileId} to ${timezone}`);

    try {
      // Verify timezone is valid
      Intl.DateTimeFormat('en-US', { timeZone: timezone }).format(new Date());
      
      // For admins, use a service role method to bypass RLS
      if (isAdmin && profileId !== session.user.id) {
        // Use an edge function to update as admin
        const { error } = await supabase.functions.invoke('admin-update-user-setting', {
          body: {
            profileId,
            settingType: 'timezone',
            settingValue: timezone
          }
        });
        
        if (error) throw error;
      } else {
        // Regular update for the user's own settings
        const { error } = await supabase
          .from('user_settings')
          .upsert({
            profile_id: profileId,
            setting_type: 'timezone',
            setting_value: timezone,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'profile_id,setting_type'
          });
        
        if (error) throw error;
      }
      
      toast({
        title: "Timezone updated",
        description: `Timezone successfully updated to ${timezone}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating timezone:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update timezone. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { updateTimezone };
}
