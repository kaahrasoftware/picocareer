
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, MapPin, Building, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";
import { CareerProfile, CareerBookmarksProps } from "./types";

export function CareerBookmarks({ activePage, onViewCareerDetails }: CareerBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['career-bookmarks', session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return { data: [], count: 0 };
      
      const { count, error: countError } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact' })
        .eq('profile_id', session.user.id)
        .eq('content_type', 'career');

      if (countError) throw countError;

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          careers (
            id,
            title,
            description,
            salary_range,
            image_url,
            industry,
            profiles_count
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'career')
        .range(start, end);

      if (error) throw error;

      const careers: CareerProfile[] = (data || []).map(bookmark => ({
        id: bookmark.careers?.id || bookmark.content_id,
        title: bookmark.careers?.title || 'Unknown Career',
        description: bookmark.careers?.description || '',
        salary_range: bookmark.careers?.salary_range || '',
        image_url: bookmark.careers?.image_url || '',
        industry: bookmark.careers?.industry || '',
        profiles_count: bookmark.careers?.profiles_count || 0,
        bookmark_id: bookmark.id
      }));

      return { data: careers, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'careers',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderCareerCard = (career: CareerProfile) => (
    <Card key={career.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{career.title}</CardTitle>
        {career.industry && (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Building className="h-3 w-3" />
            {career.industry}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {career.description && (
          <p className="text-sm text-gray-600 line-clamp-3 mb-3">
            {career.description}
          </p>
        )}
        {career.salary_range && (
          <p className="text-xs text-muted-foreground flex items-center gap-1 mb-2">
            <DollarSign className="h-3 w-3" />
            {career.salary_range}
          </p>
        )}
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {career.profiles_count || 0} professionals
          </Badge>
          <Button variant="outline" size="sm" onClick={() => onViewCareerDetails(career)}>
            View Details
          </Button>
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
        linkPath: "/careers",
        type: "careers"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={onViewCareerDetails}
      renderCard={renderCareerCard}
      bookmarkType="career"
    />
  );
}
