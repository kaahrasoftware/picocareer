
import { ReactNode, useEffect, useState } from "react";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useBookmarksRealtime } from "@/hooks/useBookmarksRealtime";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RealTimeProviderProps {
  children: ReactNode;
}

/**
 * This provider component sets up all real-time subscriptions for the application.
 * It's designed to be mounted once near the root of the app.
 */
export function RealTimeProvider({ children }: RealTimeProviderProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(true);

  // Set up global error handling for realtime
  useEffect(() => {
    const channel = supabase.channel("global-connection");

    // Handle connection state changes
    const subscription = channel
      .on("system", { event: "*" }, (status) => {
        console.log("Supabase realtime status:", status);
        
        // Update connection state
        if (status.event === "disconnect") {
          setIsConnected(false);
          toast({
            title: "Connection lost",
            description: "Real-time updates may be delayed. We'll reconnect automatically.",
            variant: "destructive",
          });
        } else if (status.event === "reconnect") {
          setIsConnected(true);
          toast({
            title: "Reconnected",
            description: "You're back online and real-time updates are working again.",
          });
        }
      })
      .subscribe();

    // Clean up on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Use the bookmarks realtime hook (only if user is logged in)
  useBookmarksRealtime(session?.user?.id);

  return <>{children}</>;
}
