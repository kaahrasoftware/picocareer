import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// This must match exactly what's in the database enum
export type SettingType = 
  | "timezone" 
  | "notifications" 
  | "language" 
  | "theme" 
  | "notification_preferences"
  | "language_preference";

// Helper type for UI-specific settings
export type UISettingType = {
  email_notifications: boolean;
  push_notifications: boolean;
  compact_mode: boolean;
  theme: string;
  timezone: string;
  notification_preferences: string;
  language_preference: string;
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
    enabled: !!profileId
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

  // Helper function to convert database settings to UI settings
  const getSetting = (type: keyof UISettingType): string | null => {
    if (!settings) return null;

    const setting = settings.find(s => s.setting_type === type);
    if (!setting) {
      // Return defaults based on setting type
      switch (type) {
        case 'notification_preferences':
          return JSON.stringify({
            email_notifications: true,
            push_notifications: true
          });
        case 'language_preference':
          return 'en';
        case 'theme':
          return 'light';
        case 'timezone':
          return null;
        default:
          return null;
      }
    }
    return setting.setting_value;
  };

  return {
    settings,
    getSetting,
    updateSetting
  };
}