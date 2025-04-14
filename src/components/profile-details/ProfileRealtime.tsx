import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

interface ProfileRealtimeProps {
  userId: string;
  open: boolean;
  session: any;
  queryClient: QueryClient;
}

export function ProfileRealtime({ userId, open, session, queryClient }: ProfileRealtimeProps) {
  useEffect(() => {
    if (!open || !userId || !session) return;

    console.log('Setting up real-time subscription for profile:', userId);

    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile changed:', payload);
          queryClient.invalidateQueries({ queryKey: ['profile', userId] });
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, open, queryClient, session]);

  return null;
}