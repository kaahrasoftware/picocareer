
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { GraduationCap } from "lucide-react";
import type { MajorProfile } from "./types";

export function MajorBookmarks() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarked-majors', userId],
    queryFn: async () => {
      if (!userId) return { bookmarks: [], totalPages: 0 };
      
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          majors!inner(
            id,
            title,
            description,
            image_url,
            category
          )
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'major')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        title: bookmark.majors.title,
        description: bookmark.majors.description,
        image_url: bookmark.majors.image_url,
        category: bookmark.majors.category
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

  const handleViewMajor = (major: MajorProfile) => {
    window.history.pushState({}, '', `/program?dialog=true&majorId=${major.id}`);
    window.dispatchEvent(new CustomEvent('openMajorDetails', { detail: major.id }));
  };

  const renderMajorCard = (major: MajorProfile, onView: (major: MajorProfile) => void) => (
    <div
      key={major.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(major)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">{major.title}</h3>
        </div>
        
        {major.category && (
          <div className="text-sm mt-4">
            <span className="font-medium">Category:</span>{" "}
            <span className="text-muted-foreground">{major.category}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <BookmarksList
      bookmarks={bookmarks}
      isLoading={isLoading}
      emptyStateProps={{
        icon: <GraduationCap className="h-6 w-6 text-primary" />,
        linkPath: "/program",
        type: "majors"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={handleViewMajor}
      renderCard={renderMajorCard}
      bookmarkType="major"
    />
  );
}
