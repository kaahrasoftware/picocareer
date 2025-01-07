import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import type { Bookmark } from "@/types/database/bookmarks";

export function BookmarksTab() {
  const { toast } = useToast();
  const { data: bookmarks = [] } = useQuery<Bookmark[]>(["bookmarks"], async () => {
    const { data, error } = await supabase.from("bookmarks").select("*");
    if (error) {
      toast({
        title: "Error fetching bookmarks",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
    return data;
  });

  return (
    <div>
      {bookmarks.map((bookmark) => (
        <div key={bookmark.id}>
          <ProfileAvatar
            avatarUrl={bookmark.profile.avatar_url}
            fallback={bookmark.profile.full_name?.[0]}
            size="md"
            userId={bookmark.profile.id}
          />
        </div>
      ))}
    </div>
  );
}
