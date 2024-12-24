import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import type { ContentType, ContentStatus } from "../types";

export function useContentData(contentType: ContentType, statusFilter: ContentStatus | "all", open: boolean) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Main data query
  const { data: items = [], isLoading } = useQuery({
    queryKey: ['content-details', contentType, statusFilter],
    queryFn: async () => {
      try {
        console.log('Fetching content with query:', { statusFilter, contentType });
        
        let query = supabase
          .from(contentType)
          .select('*')
          .order('created_at', { ascending: false });

        if (statusFilter !== "all") {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log(`Fetched ${contentType}:`, data);
        return data || [];
      } catch (error) {
        console.error(`Error fetching ${contentType}:`, error);
        toast({
          title: "Error",
          description: `Failed to fetch ${contentType}. Please try again.`,
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: open,
  });

  // Real-time subscription
  useEffect(() => {
    if (!open) return;

    console.log(`Setting up real-time subscription for: ${contentType}`);
    
    const channel = supabase
      .channel(`${contentType}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: contentType
        },
        (payload) => {
          console.log(`Real-time update received for ${contentType}:`, payload);
          queryClient.invalidateQueries({ 
            queryKey: ['content-details', contentType]
          });
        }
      )
      .subscribe((status) => {
        console.log(`Subscription status for ${contentType}:`, status);
      });

    return () => {
      console.log(`Cleaning up real-time subscription for ${contentType}`);
      supabase.removeChannel(channel);
    };
  }, [open, contentType, queryClient]);

  return { items, isLoading };
}