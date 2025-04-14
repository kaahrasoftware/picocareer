
import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface GenericBookmarkButtonProps {
  contentId: string;
  contentType: "mentor" | "career" | "major" | "scholarship";
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function GenericBookmarkButton({ 
  contentId,
  contentType,
  className = "",
  size = "md"
}: GenericBookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { session } = useAuthSession();
  const queryClient = useQueryClient();

  // Map size to dimensions
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6"
  };

  // Map content type to query key
  const getQueryKey = (type: string) => {
    switch (type) {
      case "mentor": return "bookmarked-mentors";
      case "career": return "bookmarked-careers";
      case "major": return "bookmarked-majors";
      case "scholarship": return "bookmarked-scholarships";
      default: return `bookmarked-${type}s`;
    }
  };

  const handleBookmark = async () => {
    if (!session) {
      toast({
        title: "Authentication required",
        description: "Please sign in to bookmark this item",
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
            profile_id: session.user.id,
            content_type: contentType,
            content_id: contentId,
          });

        if (error) throw error;

        setIsBookmarked(false);
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: [getQueryKey(contentType)] });
        
        toast({
          title: "Bookmark removed",
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} has been removed from your bookmarks`,
        });
      } else {
        // Add bookmark
        const { error } = await supabase.from("user_bookmarks").insert({
          profile_id: session.user.id,
          content_type: contentType,
          content_id: contentId,
        });

        if (error) throw error;

        setIsBookmarked(true);
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: [getQueryKey(contentType)] });
        
        toast({
          title: "Item bookmarked",
          description: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} has been added to your bookmarks`,
        });
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      toast({
        title: "Error",
        description: "Failed to update bookmark status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if item is bookmarked on component mount
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session) return;

      try {
        const { data, error } = await supabase
          .from("user_bookmarks")
          .select()
          .match({
            profile_id: session.user.id,
            content_type: contentType,
            content_id: contentId,
          })
          .maybeSingle();

        if (error) throw error;
        setIsBookmarked(!!data);
      } catch (error) {
        console.error("Error checking bookmark status:", error);
      }
    };

    checkBookmarkStatus();
  }, [session, contentId, contentType]);

  return (
    <button
      onClick={handleBookmark}
      disabled={isLoading}
      className={`p-2 hover:bg-muted rounded-full transition-colors ${className}`}
      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      <Heart
        className={`${sizeClasses[size]} ${
          isBookmarked ? "fill-red-500 text-red-500" : "text-muted-foreground"
        } ${isLoading ? "opacity-50" : ""}`}
      />
    </button>
  );
}
