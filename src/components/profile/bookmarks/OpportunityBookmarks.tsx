
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MapPin, Building, Calendar, BookmarkCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarkedEntity, BookmarkType } from "./types";

interface OpportunityBookmark {
  id: string;
  opportunity_id: string;
  opportunities: {
    id: string;
    title: string;
    description?: string;
    organization?: string;
    location?: string;
    deadline?: string;
    type?: string;
    status?: string;
    external_url?: string;
  };
}

export function OpportunityBookmarks() {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [removingBookmarks, setRemovingBookmarks] = useState<Set<string>>(new Set());

  const { data: bookmarks = [], isLoading, refetch } = useQuery({
    queryKey: ['opportunity-bookmarks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          opportunity_id,
          opportunities (
            id,
            title,
            description,
            organization,
            location,
            deadline,
            type,
            status,
            external_url
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('bookmark_type', 'opportunity')
        .not('opportunities', 'is', null);

      if (error) throw error;
      return data as OpportunityBookmark[];
    },
    enabled: !!session?.user?.id,
  });

  const removeBookmark = async (bookmarkId: string, opportunityTitle: string) => {
    if (!session?.user?.id) return;

    setRemovingBookmarks(prev => new Set(prev).add(bookmarkId));

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('profile_id', session.user.id);

      if (error) throw error;

      await refetch();
      toast({
        title: "Bookmark removed",
        description: `Removed "${opportunityTitle}" from your bookmarks`,
      });
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast({
        title: "Error",
        description: "Failed to remove bookmark. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingBookmarks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookmarkId);
        return newSet;
      });
    }
  };

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

  // Convert bookmarks to BookmarkedEntity format
  const bookmarkedEntities: BookmarkedEntity[] = bookmarks.map(bookmark => ({
    id: bookmark.opportunities.id,
    title: bookmark.opportunities.title,
    description: bookmark.opportunities.description,
    organization: bookmark.opportunities.organization,
    location: bookmark.opportunities.location,
    deadline: bookmark.opportunities.deadline,
    type: bookmark.opportunities.type,
    status: bookmark.opportunities.status,
    external_url: bookmark.opportunities.external_url,
    bookmark_id: bookmark.id
  }));

  const bookmarkType: BookmarkType = 'opportunity';

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {bookmarkedEntities.map((opportunity) => (
        <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeBookmark(opportunity.bookmark_id, opportunity.title || 'Untitled')}
                disabled={removingBookmarks.has(opportunity.bookmark_id)}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <BookmarkCheck className="h-4 w-4" />
              </Button>
            </div>
            {opportunity.organization && (
              <div className="flex items-center text-sm text-gray-600">
                <Building className="h-4 w-4 mr-1" />
                {opportunity.organization}
              </div>
            )}
          </CardHeader>
          
          <CardContent className="space-y-3">
            {opportunity.description && (
              <p className="text-sm text-gray-600 line-clamp-3">{opportunity.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2">
              {opportunity.type && (
                <Badge variant="secondary">{opportunity.type}</Badge>
              )}
              {opportunity.status && (
                <Badge variant={opportunity.status === 'active' ? 'default' : 'outline'}>
                  {opportunity.status}
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-500">
              {opportunity.location && (
                <div className="flex items-center">
                  <MapPin className="h-3 w-3 mr-1" />
                  {opportunity.location}
                </div>
              )}
              {opportunity.deadline && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {opportunity.external_url && (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => window.open(opportunity.external_url, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Details
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
