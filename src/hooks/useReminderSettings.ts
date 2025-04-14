
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReminderSetting {
  id: string;
  profile_id: string;
  minutes_before: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export function useReminderSettings(profileId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingReminder, setIsAddingReminder] = useState(false);

  const { data: reminderSettings = [], isLoading } = useQuery({
    queryKey: ['reminder-settings', profileId],
    queryFn: async () => {
      if (!profileId) return [];
      
      const { data, error } = await supabase
        .from('mentor_reminder_settings')
        .select('*')
        .eq('profile_id', profileId)
        .order('minutes_before', { ascending: true });
        
      if (error) {
        console.error('Error fetching reminder settings:', error);
        return [];
      }
      
      return data as ReminderSetting[];
    },
    enabled: !!profileId,
  });

  const addReminderSetting = useMutation({
    mutationFn: async ({ minutesBefore }: { minutesBefore: number }) => {
      if (!profileId) throw new Error('Profile ID is required');
      
      setIsAddingReminder(true);
      
      const { data, error } = await supabase
        .from('mentor_reminder_settings')
        .insert({ 
          profile_id: profileId, 
          minutes_before: minutesBefore 
        })
        .select()
        .single();
          
      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error('This reminder time already exists');
        }
        throw error;
      }
      
      return data as ReminderSetting;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings', profileId] });
      setIsAddingReminder(false);
    },
    onError: (error) => {
      console.error('Error adding reminder setting:', error);
      toast({
        title: "Error adding reminder",
        description: error.message || "There was a problem adding the reminder. Please try again.",
        variant: "destructive",
      });
      setIsAddingReminder(false);
    },
  });

  const updateReminderSetting = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase
        .from('mentor_reminder_settings')
        .update({ enabled })
        .eq('id', id);
          
      if (error) throw error;
      
      return { id, enabled };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings', profileId] });
    },
    onError: (error) => {
      console.error('Error updating reminder setting:', error);
      toast({
        title: "Error updating reminder",
        description: "There was a problem updating the reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteReminderSetting = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('mentor_reminder_settings')
        .delete()
        .eq('id', id);
          
      if (error) throw error;
      
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminder-settings', profileId] });
      toast({
        title: "Reminder removed",
        description: "The reminder has been removed successfully.",
      });
    },
    onError: (error) => {
      console.error('Error deleting reminder setting:', error);
      toast({
        title: "Error removing reminder",
        description: "There was a problem removing the reminder. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    reminderSettings,
    isLoading,
    isAddingReminder,
    addReminderSetting,
    updateReminderSetting,
    deleteReminderSetting,
  };
}
