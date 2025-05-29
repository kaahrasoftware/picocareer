
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

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
        <Card key={career.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{career.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {career.description}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {career.industry || 'General'}
              </span>
              <button 
                onClick={() => handleView(career)}
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
