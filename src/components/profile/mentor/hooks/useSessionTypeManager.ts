import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/integrations/supabase/types";

type SessionType = Database["public"]["Tables"]["mentor_session_types"]["Row"];

export function useSessionTypeManager(profileId: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessionTypes = [], isLoading } = useQuery({
    queryKey: ['mentor-session-types', profileId],
    queryFn: async () => {
      console.log('Fetching session types for profile:', profileId);
      const { data, error } = await supabase
        .from('mentor_session_types')
        .select('*')
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;
      console.log('Fetched session types:', data);
      return data ? [data] : [];
    },
    enabled: !!profileId
  });

  const handleDeleteSessionType = async (id: string) => {
    try {
      const { error } = await supabase
        .from('mentor_session_types')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Session type deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ['mentor-session-types'] });
    } catch (error) {
      console.error('Error deleting session type:', error);
      toast({
        title: "Error",
        description: "Failed to delete session type",
        variant: "destructive",
      });
    }
  };

  return {
    sessionTypes,
    isLoading,
    handleDeleteSessionType,
  };
}