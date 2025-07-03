
import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Update to match the database enum values
export type SettingType = 
  | 'timezone' 
  | 'theme' 
  | 'language_preference' 
  | 'notification_preferences'  // Changed from notification_settings
  | 'privacy_settings' 
  | 'display_settings' 
  | 'session_settings' 
  | 'accessibility_settings';

export interface UISettingType {
  theme: {
    theme: 'light' | 'dark';
    compact_mode: boolean;
  };
  language_preference: string;
  notification_preferences: {  // Changed from notification_settings
    email_notifications: boolean;
    app_notifications: boolean;
    mentorship_notifications: boolean;
    session_reminders: boolean;
  };
  privacy_settings: {
    profile_visibility: 'public' | 'mentees' | 'private';
    contact_info_visible: boolean;
    show_online_status: boolean;
  };
  display_settings: {
    show_recent_activity: boolean;
    show_recommendations: boolean;
    default_view: 'grid' | 'list';
  };
  session_settings: {
    defaultSessionDuration: number;
    reminderTimes: Array<15 | 30 | 60 | 1440>;
    defaultMeetingPlatform: 'Google Meet' | 'Zoom' | 'Microsoft Teams' | 'Other';
    customMeetingPlatform: string;
    allowRescheduling: boolean;
    rescheduleTimeLimit: number;
    allowCancellation: boolean;
    cancellationTimeLimit: number;
  };
  accessibility_settings: {
    high_contrast: boolean;
    large_text: boolean;
    reduce_animations: boolean;
  };
}

export function useUserSettings(profileId?: string) {
  // Get toast only if we're in a component tree with a toast provider
  let toast;
  try {
    toast = useToast();
  } catch (e) {
    // If useToast throws, we're being called outside a toast provider
    toast = {
      toast: () => {
        console.log("Toast attempted outside provider");
      }
    };
  }
  
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
        settingsObj[setting.setting_type] = setting.setting_value;
      });
      setCachedSettings(settingsObj);
      
      return data;
    },
    enabled: !!profileId,
  });

  const getSetting = useCallback((type: SettingType): string => {
    // First try from cached settings
    if (cachedSettings[type]) {
      return cachedSettings[type];
    }
    
    // Then try from query data
    const setting = settings.find(s => s.setting_type === type);
    return setting?.setting_value || '';
  }, [settings, cachedSettings]);

  const updateSetting = useMutation({
    mutationFn: async ({ type, value }: { type: SettingType; value: string }) => {
      if (!profileId) throw new Error('Profile ID is required');
      
      // Check if setting already exists
      const { data: existingSetting } = await supabase
        .from('user_settings')
        .select('id')
        .eq('profile_id', profileId)
        .eq('setting_type', type as any)  // Cast to any for database compatibility
        .single();
      
      if (existingSetting) {
        // Update existing setting
        const { error } = await supabase
          .from('user_settings')
          .update({ setting_value: value })
          .eq('id', existingSetting.id);
          
        if (error) throw error;
      } else {
        // Insert new setting
        const { error } = await supabase
          .from('user_settings')
          .insert({ 
            profile_id: profileId, 
            setting_type: type as any,  // Cast to any for database compatibility
            setting_value: value 
          });
          
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
      if (toast.toast) {
        toast.toast({
          title: "Settings updated",
          description: "Your settings have been saved successfully.",
        });
      }
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      if (toast.toast) {
        toast.toast({
          title: "Error updating settings",
          description: "There was a problem saving your settings. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  return {
    settings,
    isLoading,
    getSetting,
    updateSetting,
  };
}
