
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

export function useSessionTypeManager(profileId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessionTypes = [], isLoading, error } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async () => {
      console.log('Fetching session types for profile:', profileId);
      if (!profileId) {
        console.log('No profile ID provided');
        return [];
      }

      try {
        const { data, error } = await supabase
          .from('mentor_session_types')
          .select('*')
          .eq('profile_id', profileId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching session types:', error);
          throw error;
        }
        
        console.log('Fetched session types:', data);
        return data;
      } catch (err) {
        console.error('Exception during session types fetch:', err);
        throw err;
      }
    },
    enabled: !!profileId,
    retry: 1
  });

  const handleDeleteSessionType = async (id: string) => {
    try {
      console.log('Deleting session type with ID:', id);
      const { error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting session type:', error);
        throw error;
      }

      toast({
        title: "Success",
        description: "Session type deleted successfully",
      });

      // Immediately invalidate the query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['mentor-session-types', profileId] });
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete session type",
        variant: "destructive",
      });
    }
  };

  return {
    sessionTypes,
    isLoading,
    error,
    handleDeleteSessionType,
  };
}
