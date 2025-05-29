
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MentorCard } from "@/components/MentorCard";

export interface MentorBookmarksProps {
  bookmarkIds: string[];
  isLoading: boolean;
}

export function MentorBookmarks({ bookmarkIds, isLoading }: MentorBookmarksProps) {
  const { data: mentors = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ['bookmarked-mentors', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', bookmarkIds)
        .eq('user_type', 'mentor');
      
      if (error) throw error;
      return data;
    },
    enabled: bookmarkIds.length > 0,
  });

  return (
    <BookmarksList
      items={mentors}
      isLoading={isLoading || mentorsLoading}
      emptyMessage="No mentor bookmarks yet"
      renderItem={(mentor, handleView) => (
        <MentorCard
          key={mentor.id}
          mentor={mentor}
          onClick={() => handleView(mentor)}
        />
      )}
    />
  );
}
