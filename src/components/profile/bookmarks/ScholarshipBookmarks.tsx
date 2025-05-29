
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
        <Card key={scholarship.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-2">{scholarship.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {scholarship.description}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Badge variant="secondary">
                  ${scholarship.amount?.toLocaleString() || 'Amount varies'}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Due: {scholarship.application_deadline ? new Date(scholarship.application_deadline).toLocaleDateString() : 'Rolling'}
                </span>
              </div>
              <button 
                onClick={() => handleView(scholarship)}
                className="text-primary hover:underline text-sm w-full text-left"
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
