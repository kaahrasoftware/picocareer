
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type SettingType = 'timezone' | 'theme' | 'language_preference' | 'notification_settings' | 'privacy_settings' | 'display_settings' | 'session_settings' | 'accessibility_settings';

export interface UISettingType {
  theme: {
    theme: 'light' | 'dark';
    compact_mode: boolean;
  };
  language_preference: string;
  notification_settings: {
    email_notifications: boolean;
    app_notifications: boolean;
    mentorship_notifications: boolean;
    session_reminders: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'private' | 'mentors_only';
    contact_info_visible: boolean;
    show_online_status: boolean;
  };
  display_settings: {
    show_recent_activity: boolean;
    show_recommendations: boolean;
    default_view: 'grid' | 'list';
  };
  session_settings: {
    auto_accept_sessions: boolean;
    default_session_length: number;
    buffer_time_minutes: number;
  };
  accessibility_settings: {
    high_contrast: boolean;
    large_text: boolean;
    reduce_animations: boolean;
  };
}

export function useUserSettings(profileId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cachedSettings, setCachedSettings] = useState<Record<string, string>>({});

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['user-settings', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('profile_id', profileId);
        
      if (error) {
        console.error('Error fetching user settings:', error);
        return [];
      }
      
      // Update cached settings
      const settingsObj: Record<string, string> = {};
      data.forEach(setting => {
        settingsObj[setting.type] = setting.value;
      });
      setCachedSettings(settingsObj);
      
      return data;
    },
    enabled: !!profileId,
  });

  const getSetting = useCallback((type: SettingType | keyof UISettingType): string => {
    // First try from cached settings
    if (cachedSettings[type]) {
      return cachedSettings[type];
    }
    
    // Then try from query data
    const setting = settings.find(s => s.type === type);
    return setting?.value || '';
  }, [settings, cachedSettings]);

  const updateSetting = useMutation({
    mutationFn: async ({ type, value }: { type: SettingType; value: string }) => {
      if (!profileId) throw new Error('Profile ID is required');
      
      // Check if setting already exists
      const { data: existingSetting } = await supabase
        .from('user_settings')
        .select('id')
        .eq('profile_id', profileId)
        .eq('type', type)
        .single();
      
      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('user_settings')
          .update({ value })
          .eq('id', existingSetting.id);
          
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('user_settings')
          .insert({ profile_id: profileId, type, value });
          
        if (error) throw error;
      }
      
      // Update cached settings
      setCachedSettings(prev => ({
        ...prev,
        [type]: value,
      }));
      
      return { type, value };
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
        title: "Error updating settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting,
  };
}
