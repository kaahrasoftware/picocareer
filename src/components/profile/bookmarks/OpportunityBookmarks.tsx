
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MapPin, Building, Calendar, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OpportunityBookmarksProps {
  activePage: string;
}

export function OpportunityBookmarks({ activePage }: OpportunityBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();

  const { data: bookmarks = [], isLoading } = useQuery({
    queryKey: ['opportunity-bookmarks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('content_type', 'opportunity');

      if (error) throw error;
      return data || [];
    },
    enabled: !!session?.user?.id && activePage === 'opportunities',
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12">
        <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarked opportunities</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start exploring opportunities and bookmark the ones you're interested in.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => (
        <Card key={bookmark.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg line-clamp-2">Opportunity Bookmark</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Bookmark ID: {bookmark.id}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
