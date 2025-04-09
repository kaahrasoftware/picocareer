
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";

interface RescheduleParams {
  sessionId: string;
  newTime: string;
}

interface CancelParams {
  sessionId: string;
  reason: string;
}

export function useSessionManagement() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Session rescheduling mutation
  const rescheduleSession = useMutation({
    mutationFn: async ({ sessionId, newTime }: RescheduleParams) => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-session', {
          body: {
            action: 'reschedule',
            sessionId,
            newTime,
            userId: session?.user?.id
          }
        });
        
        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Session rescheduled",
        description: "The session has been successfully rescheduled.",
      });
      
      // Invalidate sessions data
      queryClient.invalidateQueries({ queryKey: ["session-events"] });
    },
    onError: (error: any) => {
      console.error("Error rescheduling session:", error);
      
      toast({
        title: "Rescheduling failed",
        description: error.message || "An error occurred while rescheduling the session.",
        variant: "destructive",
      });
    }
  });

  // Session cancellation mutation
  const cancelSession = useMutation({
    mutationFn: async ({ sessionId, reason }: CancelParams) => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase.functions.invoke('manage-session', {
          body: {
            action: 'cancel',
            sessionId,
            reason,
            userId: session?.user?.id
          }
        });
        
        if (error) throw error;
        return data;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Session cancelled",
        description: "The session has been successfully cancelled.",
      });
      
      // Invalidate sessions data
      queryClient.invalidateQueries({ queryKey: ["session-events"] });
    },
    onError: (error: any) => {
      console.error("Error cancelling session:", error);
      
      toast({
        title: "Cancellation failed",
        description: error.message || "An error occurred while cancelling the session.",
        variant: "destructive",
      });
    }
  });

  return {
    isLoading,
    rescheduleSession,
    cancelSession
  };
}
