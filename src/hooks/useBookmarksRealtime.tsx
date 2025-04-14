
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * A hook that subscribes to real-time updates for user bookmarks
 * and invalidates the appropriate queries when bookmarks change.
 */
export function useBookmarksRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!userId) return;

    console.log("Setting up bookmarks real-time subscription for user:", userId);

    // Create a channel to listen for changes to user_bookmarks table
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'user_bookmarks',
          filter: `profile_id=eq.${userId}`, // Only listen for this user's bookmarks
        },
        (payload) => {
          console.log('Bookmark change detected:', payload);
          
          // Get content type from the changed record
          const contentType = payload.new?.content_type || payload.old?.content_type;
          
          if (!contentType) {
            console.error('Unable to determine content type from payload:', payload);
            return;
          }
          
          try {
            // Normalize content type for query key (e.g., "mentor" -> "mentors")
            let queryKey: string;
            switch (contentType) {
              case 'mentor':
                queryKey = 'bookmarked-mentors';
                break;
              case 'career':
                queryKey = 'bookmarked-careers';
                break;
              case 'major':
                queryKey = 'bookmarked-majors';
                break;
              case 'scholarship':
                queryKey = 'bookmarked-scholarships';
                break;
              default:
                queryKey = `bookmarked-${contentType}s`;
            }
            
            // Invalidate all pages of the specific bookmark type query
            console.log(`Invalidating queries for key: ${queryKey}`);
            queryClient.invalidateQueries({ queryKey: [queryKey, userId] });
            
            // Determine action type for toast message
            let actionMessage = '';
            if (payload.eventType === 'INSERT') {
              actionMessage = 'Bookmark added';
            } else if (payload.eventType === 'DELETE') {
              actionMessage = 'Bookmark removed';
            }
            
            // Only show toast for meaningful events
            if (actionMessage) {
              toast({
                title: actionMessage,
                description: `Your ${contentType} bookmarks have been updated`,
                variant: "default",
              });
            }
          } catch (error) {
            console.error('Error handling bookmark change:', error);
          }
        }
      )
      .subscribe();

    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up bookmarks real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient, toast]);
  
  return null; // This hook doesn't return anything
}
