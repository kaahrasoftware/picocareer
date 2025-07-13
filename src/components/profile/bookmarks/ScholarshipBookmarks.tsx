
import React, { useState } from 'react';
import { BookmarkX } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthSession } from '@/hooks/useAuthSession';
import { Button } from '@/components/ui/button';
import { ModernScholarshipCard } from './ModernScholarshipCard';
import { ModernLoadingSkeleton } from './ModernLoadingSkeleton';

interface ScholarshipProfile {
  id: string;
  title: string;
  description: string;
  provider_name: string;
  amount?: number;
  deadline: string;
  status: string;
  application_url: string;
  category: string[];
  tags: string[];
  featured: boolean;
  bookmark_id: string;
}

interface ScholarshipBookmarksProps {
  activePage: string;
}

export function ScholarshipBookmarks({ activePage }: ScholarshipBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['scholarship-bookmarks', session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return { data: [], count: 0 };
      
      // Get total count first
      const { count, error: countError } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact' })
        .eq('profile_id', session.user.id)
        .eq('content_type', 'scholarship');

      if (countError) throw countError;

      // Get paginated bookmarks
      const start = (currentPage - 1) * PAGE_SIZE;
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'scholarship')
        .range(start, start + PAGE_SIZE - 1);

      if (error) throw error;
      
      if (!data || data.length === 0) return { data: [], count: count || 0 };

      // Get scholarship details
      const scholarshipIds = data.map(bookmark => bookmark.content_id);
      const { data: scholarshipData, error: scholarshipError } = await supabase
        .from('scholarships')
        .select(`
          id,
          title,
          description,
          provider_name,
          amount,
          deadline,
          status,
          application_url,
          category,
          tags,
          featured
        `)
        .in('id', scholarshipIds);

      if (scholarshipError) throw scholarshipError;

      const scholarships = scholarshipData?.map(scholarship => ({
        ...scholarship,
        bookmark_id: data.find(bookmark => bookmark.content_id === scholarship.id)?.id
      })) || [];

      return { data: scholarships, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'scholarships'
  });

  const scholarships = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const removeBookmarkMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      if (!session?.user?.id) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('profile_id', session.user.id)
        .eq('content_id', scholarshipId)
        .eq('content_type', 'scholarship');

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarship-bookmarks'] });
      toast({
        title: 'Bookmark removed',
        description: 'Scholarship has been removed from your bookmarks.',
      });
      setRemovingId(null);
    },
    onError: (error) => {
      console.error('Error removing bookmark:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove bookmark. Please try again.',
        variant: 'destructive',
      });
      setRemovingId(null);
    },
  });

  const handleRemoveBookmark = (scholarshipId: string) => {
    setRemovingId(scholarshipId);
    removeBookmarkMutation.mutate(scholarshipId);
  };


  if (isLoading) {
    return <ModernLoadingSkeleton />;
  }

  if (scholarships.length === 0) {
    return (
      <div className="text-center py-12">
        <BookmarkX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No bookmarked scholarships</h3>
        <p className="text-muted-foreground">
          Start exploring scholarships and bookmark the ones you're interested in.
        </p>
        <Button className="mt-4" asChild>
          <a href="/scholarships">Browse Scholarships</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">
          Bookmarked Scholarships ({totalCount})
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {scholarships.map((scholarship) => (
          <ModernScholarshipCard
            key={scholarship.id}
            scholarship={scholarship}
            onRemove={handleRemoveBookmark}
            isRemoving={removingId === scholarship.id}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className="w-8"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
