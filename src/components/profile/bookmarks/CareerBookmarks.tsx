
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CareerCard } from "@/components/CareerCard";

export interface CareerBookmarksProps {
  bookmarkIds: string[];
  isLoading: boolean;
}

export function CareerBookmarks({ bookmarkIds, isLoading }: CareerBookmarksProps) {
  const { data: careers = [], isLoading: careersLoading } = useQuery({
    queryKey: ['bookmarked-careers', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('careers')
        .select('*')
        .in('id', bookmarkIds);
      
      if (error) throw error;
      return data;
    },
    enabled: bookmarkIds.length > 0,
  });

  return (
    <BookmarksList
      items={careers}
      isLoading={isLoading || careersLoading}
      emptyMessage="No career bookmarks yet"
      renderItem={(career, handleView) => (
        <CareerCard
          key={career.id}
          career={career}
          onClick={() => handleView(career)}
        />
      )}
    />
  );
}
