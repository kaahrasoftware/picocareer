import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SettingType = "timezone" | "notifications" | "language" | "theme";

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

  const { data: settings } = useQuery({
    queryKey: ['user-settings', profileId],
    queryFn: async () => {
      if (!profileId) {
        console.log('No profile ID provided for settings query');
        return null;
      }
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('profile_id', profileId);
      
      if (error) {
        console.error('Error fetching settings:', error);
        return null;
      }
      
      return data as UserSetting[];
    },
    enabled: !!profileId // Only run query if profileId exists
  });

  const updateSetting = useMutation({
    mutationFn: async ({ type, value }: { type: SettingType; value: string }) => {
      if (!profileId) throw new Error('No profile ID provided');

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

      if (error) throw error;
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
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getSetting = (type: keyof UISettingType): string | null => {
    if (!settings) return null;

    switch (type) {
      case 'email_notifications':
      case 'push_notifications':
        const notificationSetting = settings.find(s => s.setting_type === 'notifications');
        if (!notificationSetting) return 'false';
        try {
          const notifications = JSON.parse(notificationSetting.setting_value);
          return notifications[type]?.toString() || 'false';
        } catch {
          return 'false';
        }
      
      case 'compact_mode':
      case 'theme':
        const themeSetting = settings.find(s => s.setting_type === 'theme');
        if (!themeSetting) return type === 'theme' ? 'light' : 'false';
        try {
          const themeSettings = JSON.parse(themeSetting.setting_value);
          return type === 'theme' 
            ? themeSettings.theme || 'light'
            : themeSettings.compact_mode?.toString() || 'false';
        } catch {
          return type === 'theme' ? 'light' : 'false';
        }
      
      case 'timezone':
        const timezone = settings.find(s => s.setting_type === 'timezone');
        return timezone?.setting_value || Intl.DateTimeFormat().resolvedOptions().timeZone;
      
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