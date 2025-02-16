
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bookmark, Search } from "lucide-react";
import { useQuery } from '@tanstack/react-query';

interface PopularContent {
  content_type: string;
  content_id: string;
  title: string;
  bookmark_count: number;
  search_count: number;
}

interface HubRecommendationsProps {
  hubId: string;
}

export function HubRecommendations({ hubId }: HubRecommendationsProps) {
  const { toast } = useToast();

  const { data: recommendations = [] } = useQuery({
    queryKey: ['hub-recommendations', hubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_hub_recommendations', { p_hub_id: hubId });

      if (error) {
        console.error("Error fetching recommendations:", error);
        toast({
          title: "Error fetching recommendations",
          description: error.message,
          variant: "destructive"
        });
        return [];
      }

      return data as PopularContent[];
    }
  });

  const mostBookmarked = [...recommendations]
    .sort((a, b) => b.bookmark_count - a.bookmark_count)
    .slice(0, 5);

  const mostSearched = [...recommendations]
    .sort((a, b) => b.search_count - a.search_count)
    .slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Most Bookmarked Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mostBookmarked.length > 0 ? (
              mostBookmarked.map((item) => (
                <div key={item.content_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.content_type}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Bookmark className="h-4 w-4" />
                    <span>{item.bookmark_count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No bookmarked content yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="h-5 w-5" />
            Most Searched Content
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mostSearched.length > 0 ? (
              mostSearched.map((item) => (
                <div key={item.content_id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground capitalize">{item.content_type}</p>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                    <span>{item.search_count}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No searched content yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
