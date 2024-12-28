import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SettingType = 'timezone' | 'notifications' | 'language' | 'theme';

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
      if (!profileId) return null;
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('profile_id', profileId);
      
      if (error) {
        console.error('Error fetching user settings:', error);
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

  const getSetting = (type: SettingType): string | null => {
    if (!settings) return null;
    const setting = settings.find(s => s.setting_type === type);
    return setting?.setting_value || null;
  };

  return {
    settings,
    getSetting,
    updateSetting
  };
}