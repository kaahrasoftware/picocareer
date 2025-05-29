
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MajorCard } from "@/components/MajorCard";

export interface MajorBookmarksProps {
  bookmarkIds: string[];
  isLoading: boolean;
}

export function MajorBookmarks({ bookmarkIds, isLoading }: MajorBookmarksProps) {
  const { data: majors = [], isLoading: majorsLoading } = useQuery({
    queryKey: ['bookmarked-majors', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('majors')
        .select('*')
        .in('id', bookmarkIds);
      
      if (error) throw error;
      return data;
    },
    enabled: bookmarkIds.length > 0,
  });

  return (
    <BookmarksList
      items={majors}
      isLoading={isLoading || majorsLoading}
      emptyMessage="No major bookmarks yet"
      renderItem={(major, handleView) => (
        <MajorCard
          key={major.id}
          major={major}
          onClick={() => handleView(major)}
        />
      )}
    />
  );
}
