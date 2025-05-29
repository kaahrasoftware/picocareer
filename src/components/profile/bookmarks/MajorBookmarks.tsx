
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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
        <Card key={major.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{major.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {major.description}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {major.category?.join(', ') || 'General'}
              </span>
              <button 
                onClick={() => handleView(major)}
                className="text-primary hover:underline text-sm"
              >
                View Details
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
