
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Since app_settings table doesn't exist, create a mock hook that returns default values
export function useAppSettings() {
  const { toast } = useToast();

  // Mock settings data
  const mockSettings: Record<string, string> = {
    site_name: 'PicoCareer',
    support_email: 'support@picocareer.com',
    maintenance_mode: 'false',
    max_file_size: '10485760' // 10MB
  };

  // Mock query that returns default settings
  const { data: settingsArray = [], isLoading, error } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      // Return mock data since table doesn't exist
      return Object.entries(mockSettings).map(([key, value]) => ({
        id: key,
        key,
        value,
        description: `Setting for ${key}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Convert array to object for easier access
  const settings: Record<string, string> = {};
  settingsArray.forEach(setting => {
    settings[setting.key] = setting.value;
  });

  // Mock update mutation
  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      // Mock implementation - in reality this would update the database
      console.log(`Would update setting ${key} to ${value}`);
      return { key, value };
    },
    onSuccess: () => {
      // Mock success
      console.log('Setting updated successfully (mock)');
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
