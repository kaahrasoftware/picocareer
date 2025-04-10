
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AppSetting {
  id: string;
  key: string;
  value: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export function useAppSettings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch all app settings
  const { data: settingsArray = [], isLoading, error } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .order('key');
        
      if (error) {
        console.error('Error fetching app settings:', error);
        throw error;
      }
      
      return data as AppSetting[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  settingsArray.forEach(setting => {
    settings[setting.key] = setting.value;
  });

  // Update a setting
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Check if setting exists
      const { data: existingSetting } = await supabase
        .from('app_settings')
        .select('id')
        .eq('key', key)
        .single();
      
      if (existingSetting) {
        // Update existing setting
        const { data, error } = await supabase
          .from('app_settings')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('id', existingSetting.id)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      } else {
        // Insert new setting
        const { data, error } = await supabase
          .from('app_settings')
          .insert({ 
            key, 
            value,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
          
        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
    },
    onError: (error) => {
      console.error('Error updating setting:', error);
      toast({
        title: "Error updating setting",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Get a specific setting value
  const getSetting = (key: string, defaultValue: string = '') => {
    return settings[key] || defaultValue;
  };

  return {
    settings,
    settingsArray,
    isLoading,
    error,
    updateSetting,
    getSetting,
  };
}
