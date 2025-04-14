
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface GenericBookmarkButtonProps {
  contentId: string;
  contentType: "mentor" | "career" | "major" | "scholarship";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GenericBookmarkButton({ 
  contentId, 
  contentType, 
  size = "md",
  className = "" 
}: GenericBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session: authSession } = useAuthSession();
  const queryClient = useQueryClient();

  // Map content types to their respective query keys
  const contentTypeQueryKeyMap = {
    mentor: "bookmarked-mentors",
    career: "bookmarked-careers",
    major: "bookmarked-majors",
    scholarship: "bookmarked-scholarships"
  };

  // Get the size classes based on size prop
  const getSizeClasses = () => {
    switch(size) {
      case "sm": return "p-1.5 h-4 w-4";
      case "lg": return "p-2.5 h-6 w-6";
      default: return "p-2 h-5 w-5";
    }
  };
  
  const buttonSizeClass = size === "sm" ? "p-1" : size === "lg" ? "p-3" : "p-2";
  const iconSizeClass = getSizeClasses();

  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!authSession) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select()
          .match({
            profile_id: authSession.user.id,
            content_type: contentType,
            content_id: contentId,
          })
          .maybeSingle();

        if (error) throw error;
        setIsBookmarked(!!data);
      } catch (error) {
        console.error(`Error checking ${contentType} bookmark status:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    checkBookmarkStatus();
    
    // Set up real-time subscription for bookmark changes
    if (authSession) {
      const channelName = `bookmark-${contentType}-${contentId}`;
      console.log(`Setting up channel: ${channelName}`);
      
      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_bookmarks',
            filter: `profile_id=eq.${authSession.user.id} AND content_type=eq.${contentType} AND content_id=eq.${contentId}`
          },
          (payload) => {
            console.log(`${contentType} bookmark changed:`, payload);
            
            // Update local state based on the change
            if (payload.eventType === 'INSERT') {
              setIsBookmarked(true);
            } else if (payload.eventType === 'DELETE') {
              setIsBookmarked(false);
            }
            
            // Invalidate the corresponding query
            queryClient.invalidateQueries({ 
              queryKey: [contentTypeQueryKeyMap[contentType]] 
            });
          }
        )
        .subscribe((status) => {
          console.log(`Bookmark subscription status for ${channelName}:`, status);
        });
      
      return () => {
        console.log(`Removing channel: ${channelName}`);
        supabase.removeChannel(channel);
      };
    }
  }, [authSession, contentId, contentType, queryClient]);

  const handleBookmark = async () => {
    if (!authSession) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark content",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from("user_bookmarks")
          .delete()
          .match({
            profile_id: authSession.user.id,
            content_type: contentType,
            content_id: contentId,
          });

        if (error) throw error;

        setIsBookmarked(false);
        
        toast({
          title: "Bookmark removed",
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} has been removed from your bookmarks`,
        });
      } else {
        // Add bookmark
        const { error } = await supabase.from("user_bookmarks").insert({
          profile_id: authSession.user.id,
          content_type: contentType,
          content_id: contentId,
        });

        if (error) throw error;

        setIsBookmarked(true);
        
        toast({
          title: "Bookmark added",
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} has been added to your bookmarks`,
        });
      }
      
      // Invalidate the query for immediate UI update
      queryClient.invalidateQueries({ 
        queryKey: [contentTypeQueryKeyMap[contentType]] 
      });
      
    } catch (error) {
      console.error(`Error toggling ${contentType} bookmark:`, error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!authSession) return null;

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`${buttonSizeClass} hover:bg-muted rounded-full transition-colors ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Heart
        className={`${iconSizeClass} ${
          isBookmarked ? "fill-red-500 text-red-500" : "text-muted-foreground"
        } ${isLoading ? "opacity-50" : ""}`}
      />
    </button>
  );
}
