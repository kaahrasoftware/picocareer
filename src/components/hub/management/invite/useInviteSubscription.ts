
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useInviteSubscription(hubId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('hub-invites')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'hub_member_invites',
          filter: `hub_id=eq.${hubId}`
        },
        (payload) => {
          console.log('Invite change received:', payload);
          queryClient.invalidateQueries({ queryKey: ['hub-pending-invites', hubId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [hubId, queryClient]);
}
