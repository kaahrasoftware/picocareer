import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// This must match exactly what's in the database enum
export type SettingType = "timezone" | "notifications" | "language" | "theme";

// Helper type for UI-specific settings that map to our database settings
export type UISettingType = {
  email_notifications: boolean;
  push_notifications: boolean;
  compact_mode: boolean;
  theme: string;
  timezone: string;
};

interface UserSetting {
  id: string;
  profile_id: string;
  setting_type: SettingType;
  setting_value: string;
}

export function useUserSettings(profileId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  console.log("useUserSettings - Profile ID:", profileId);

  const { data: settings } = useQuery({
    queryKey: ['user-settings', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log("useUserSettings - No profile ID provided");
        return null;
      }
      
      console.log("useUserSettings - Fetching settings for profile:", profileId);
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('profile_id', profileId);
      
      if (error) {
        console.error('useUserSettings - Error fetching settings:', error);
        return null;
      }
      
      console.log("useUserSettings - Fetched settings:", data);
      return data as UserSetting[];
    },
    enabled: !!profileId
  });

  const updateSetting = useMutation({
    mutationFn: async ({ type, value }: { type: SettingType; value: string }) => {
      if (!profileId) throw new Error('No profile ID provided');

      console.log("useUserSettings - Updating setting:", { profileId, type, value });

      const { data, error } = await supabase
        .from('user_settings')
        .upsert({
          profile_id: profileId,
          setting_type: type,
          setting_value: value
        }, {
          onConflict: 'profile_id,setting_type'
        })
        .select()
        .single();

      if (error) {
        console.error('useUserSettings - Error updating setting:', error);
        throw error;
      }
      
      console.log("useUserSettings - Setting updated successfully:", data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings', profileId] });
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('useUserSettings - Mutation error:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Helper function to convert database settings to UI settings
  const getSetting = (type: keyof UISettingType): string | null => {
    if (!settings) return null;

    switch (type) {
      case 'email_notifications':
      case 'push_notifications':
        const notificationSetting = settings.find(s => s.setting_type === 'notifications');
        if (!notificationSetting) return null;
        const notifications = JSON.parse(notificationSetting.setting_value || '{}');
        return notifications[type]?.toString() || 'false';
      
      case 'compact_mode':
        const themeSetting = settings.find(s => s.setting_type === 'theme');
        if (!themeSetting) return null;
        const themeSettings = JSON.parse(themeSetting.setting_value || '{}');
        return themeSettings.compact_mode?.toString() || 'false';
      
      case 'theme':
        const theme = settings.find(s => s.setting_type === 'theme');
        return theme?.setting_value || null;
      
      case 'timezone':
        const timezone = settings.find(s => s.setting_type === 'timezone');
        return timezone?.setting_value || null;
      
      default:
        return null;
    }
  };

  return {
    settings,
    getSetting,
    updateSetting
  };
}