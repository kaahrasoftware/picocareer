
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ScholarshipCard } from "@/components/scholarships/ScholarshipCard";

export interface ScholarshipBookmarksProps {
  bookmarkIds: string[];
  isLoading: boolean;
}

export function ScholarshipBookmarks({ bookmarkIds, isLoading }: ScholarshipBookmarksProps) {
  const { data: scholarships = [], isLoading: scholarshipsLoading } = useQuery({
    queryKey: ['bookmarked-scholarships', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('scholarships')
        .select('*')
        .in('id', bookmarkIds);
      
      if (error) throw error;
      return data.map(scholarship => ({
        ...scholarship,
        amount: scholarship.amount || 0,
        academic_requirements: scholarship.academic_requirements || {},
      }));
    },
    enabled: bookmarkIds.length > 0,
  });

  return (
    <BookmarksList
      items={scholarships}
      isLoading={isLoading || scholarshipsLoading}
      emptyMessage="No scholarship bookmarks yet"
      renderItem={(scholarship, handleView) => (
        <ScholarshipCard
          key={scholarship.id}
          scholarship={scholarship}
          onClick={() => handleView(scholarship)}
        />
      )}
    />
  );
}
