
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { Award } from "lucide-react";
import type { ScholarshipProfile } from "./types";

export function ScholarshipBookmarks() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarked-scholarships', userId],
    queryFn: async () => {
      if (!userId) return { bookmarks: [], totalPages: 0 };
      
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          scholarships!inner(
            id,
            name,
            provider,
            amount,
            deadline,
            image_url
          )
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'scholarship')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        name: bookmark.scholarships.name,
        provider: bookmark.scholarships.provider,
        amount: bookmark.scholarships.amount,
        deadline: bookmark.scholarships.deadline,
        image_url: bookmark.scholarships.image_url
      }));

      return { 
        bookmarks: formattedBookmarks,
        totalPages: Math.ceil(formattedBookmarks.length / 10)
      };
    },
    enabled: !!userId,
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const bookmarks = data?.bookmarks || [];
  const totalPages = data?.totalPages || 1;

  const handleViewScholarship = (scholarship: ScholarshipProfile) => {
    window.history.pushState({}, '', `/scholarships?dialog=true&scholarshipId=${scholarship.id}`);
    window.dispatchEvent(new CustomEvent('openScholarshipDetails', { detail: scholarship.id }));
  };

  const renderScholarshipCard = (scholarship: ScholarshipProfile, onView: (scholarship: ScholarshipProfile) => void) => (
    <div
      key={scholarship.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(scholarship)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Award className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">{scholarship.name}</h3>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          {scholarship.provider && (
            <div className="text-sm">
              <span className="font-medium">Provider:</span>{" "}
              <span className="text-muted-foreground">{scholarship.provider}</span>
            </div>
          )}
          {scholarship.amount && (
            <div className="text-sm">
              <span className="font-medium">Amount:</span>{" "}
              <span className="text-muted-foreground">{scholarship.amount}</span>
            </div>
          )}
          {scholarship.deadline && (
            <div className="text-sm">
              <span className="font-medium">Deadline:</span>{" "}
              <span className="text-muted-foreground">{scholarship.deadline}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <BookmarksList
      bookmarks={bookmarks}
      isLoading={isLoading}
      emptyStateProps={{
        icon: <Award className="h-6 w-6 text-primary" />,
        linkPath: "/scholarships",
        type: "scholarships"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={handleViewScholarship}
      renderCard={renderScholarshipCard}
      bookmarkType="scholarship"
    />
  );
}
