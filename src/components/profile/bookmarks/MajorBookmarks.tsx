
import React from 'react';  // Explicitly import React
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { GraduationCap } from "lucide-react";
import { MajorProfile } from "./types";

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
            degree_levels,
            featured,
            potential_salary,
            skill_match,
            tools_knowledge,
            common_courses,
            profiles_count
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
        degree_levels: bookmark.majors.degree_levels,
        featured: bookmark.majors.featured,
        potential_salary: bookmark.majors.potential_salary,
        skill_match: bookmark.majors.skill_match,
        tools_knowledge: bookmark.majors.tools_knowledge,
        common_courses: bookmark.majors.common_courses,
        profiles_count: bookmark.majors.profiles_count
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
    // Open the major details dialog
    window.history.pushState({}, '', `/program?dialog=true&majorId=${major.id}`);
    // Dispatch a custom event to open the major details dialog
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
        
        <div className="flex flex-col gap-2 mt-4">
          {major.potential_salary && (
            <div className="text-sm">
              <span className="font-medium">Potential Salary:</span>{" "}
              <span className="text-muted-foreground">{major.potential_salary}</span>
            </div>
          )}
          {major.degree_levels && major.degree_levels.length > 0 && (
            <div className="text-sm">
              <span className="font-medium">Degree Levels:</span>{" "}
              <span className="text-muted-foreground">{major.degree_levels.join(', ')}</span>
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
