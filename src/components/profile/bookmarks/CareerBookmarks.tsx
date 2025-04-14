
import React from 'react';  // Explicitly import React
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { Briefcase } from "lucide-react";
import type { CareerProfile } from "./types";

export function CareerBookmarks() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarked-careers', userId],
    queryFn: async () => {
      if (!userId) return { bookmarks: [], totalPages: 0 };
      
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          careers!inner(
            id,
            title,
            description,
            salary_range,
            image_url,
            industry,
            profiles_count
          )
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'career')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        title: bookmark.careers.title,
        description: bookmark.careers.description,
        salary_range: bookmark.careers.salary_range,
        image_url: bookmark.careers.image_url,
        industry: bookmark.careers.industry,
        profiles_count: bookmark.careers.profiles_count
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

  const handleViewCareer = (career: CareerProfile) => {
    // Open the career details dialog
    window.history.pushState({}, '', `/career?dialog=true&careerId=${career.id}`);
    // Dispatch a custom event to open the career details dialog
    window.dispatchEvent(new CustomEvent('openCareerDetails', { detail: career.id }));
  };

  const renderCareerCard = (career: CareerProfile, onView: (career: CareerProfile) => void) => (
    <div
      key={career.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(career)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <h3 className="font-semibold text-base">{career.title}</h3>
        </div>
        
        <div className="flex flex-col gap-2 mt-4">
          {career.salary_range && (
            <div className="text-sm">
              <span className="font-medium">Salary Range:</span>{" "}
              <span className="text-muted-foreground">{career.salary_range}</span>
            </div>
          )}
          {career.industry && (
            <div className="text-sm">
              <span className="font-medium">Industry:</span>{" "}
              <span className="text-muted-foreground">{career.industry}</span>
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
        icon: <Briefcase className="h-6 w-6 text-primary" />,
        linkPath: "/career",
        type: "careers"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={handleViewCareer}
      renderCard={renderCareerCard}
      bookmarkType="career"
    />
  );
}
