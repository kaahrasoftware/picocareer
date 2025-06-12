
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MapPin, Building, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";

interface OpportunityBookmarksProps {
  activePage: string;
}

interface OpportunityItem {
  id: string;
  title?: string;
  description?: string;
  organization?: string;
  location?: string;
  deadline?: string;
  type?: string;
  status?: string;
  external_url?: string;
  bookmark_id: string;
}

export function OpportunityBookmarks({ activePage }: OpportunityBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['opportunity-bookmarks', session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return { data: [], count: 0 };
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact' })
        .eq('profile_id', session.user.id)
        .eq('content_type', 'opportunity');

      if (countError) throw countError;

      // Get paginated bookmarks
      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('profile_id', session.user.id)
        .eq('content_type', 'opportunity')
        .range(start, end);

      if (error) throw error;

      // Transform the data to match expected structure
      const opportunities: OpportunityItem[] = (data || []).map(bookmark => ({
        id: bookmark.content_id,
        title: `Opportunity ${bookmark.content_id}`,
        description: 'Bookmarked opportunity',
        bookmark_id: bookmark.id
      }));

      return { data: opportunities, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'opportunities',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderOpportunityCard = (opportunity: OpportunityItem) => (
    <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{opportunity.title}</CardTitle>
        {opportunity.organization && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            {opportunity.organization}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {opportunity.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {opportunity.description}
          </p>
        )}
        {opportunity.location && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <MapPin className="h-3 w-3" />
            {opportunity.location}
          </p>
        )}
        {opportunity.deadline && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-3">
            <Calendar className="h-3 w-3" />
            Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
          </p>
        )}
        <div className="flex items-center justify-between">
          {opportunity.type && (
            <Badge variant="secondary" className="text-xs">
              {opportunity.type}
            </Badge>
          )}
          {opportunity.external_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={opportunity.external_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3 w-3 mr-1" />
                View
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <BookmarksList
      bookmarks={bookmarks}
      isLoading={isLoading}
      emptyStateProps={{
        icon: <Bookmark className="h-8 w-8 text-primary" />,
        linkPath: "/opportunities",
        type: "opportunities"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={() => {}}
      renderCard={(item) => renderOpportunityCard(item)}
      bookmarkType="opportunity"
    />
  );
}
