
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Bookmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";
import { ModernCareerCard } from "./ModernCareerCard";
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
          content_id
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'career')
        .range(start, end);

      if (error) throw error;

      // Get career details separately
      const careerIds = data?.map(bookmark => bookmark.content_id) || [];
      if (careerIds.length === 0) {
        return { data: [], count: count || 0 };
      }

      const { data: careersData, error: careersError } = await supabase
        .from('careers')
        .select('*')
        .in('id', careerIds);

      if (careersError) throw careersError;

      const careers: CareerProfile[] = (data || []).map(bookmark => {
        const career = careersData?.find(c => c.id === bookmark.content_id);
        return {
          id: career?.id || bookmark.content_id,
          title: career?.title || 'Unknown Career',
          description: career?.description || '',
          salary_range: career?.salary_range || '',
          image_url: career?.image_url || '',
          industry: career?.industry || '',
          profiles_count: career?.profiles_count || 0,
          bookmark_id: bookmark.id
        };
      });

      return { data: careers, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'careers',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderCareerCard = (career: CareerProfile) => (
    <ModernCareerCard 
      key={career.id} 
      career={career} 
      onView={onViewCareerDetails} 
    />
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
