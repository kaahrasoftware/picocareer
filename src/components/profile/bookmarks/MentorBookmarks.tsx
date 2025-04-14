
import React from 'react';  // Explicitly import React
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { User } from "lucide-react";
import { MentorProfile } from "./types";

export function MentorBookmarks() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data, isLoading } = useQuery({
    queryKey: ['bookmarked-mentors', userId],
    queryFn: async () => {
      if (!userId) return { bookmarks: [], totalPages: 0 };
      
      const { data: bookmarks, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          profiles!inner(
            id,
            full_name,
            avatar_url,
            user_type,
            position,
            bio,
            company_id,
            company:companies(name),
            location,
            skills,
            top_mentor
          )
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'mentor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        full_name: bookmark.profiles.full_name,
        avatar_url: bookmark.profiles.avatar_url,
        user_type: bookmark.profiles.user_type,
        position: bookmark.profiles.position,
        bio: bookmark.profiles.bio,
        company_id: bookmark.profiles.company_id,
        location: bookmark.profiles.location,
        skills: bookmark.profiles.skills,
        top_mentor: bookmark.profiles.top_mentor,
        company_name: bookmark.profiles.company?.name
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

  const handleViewMentor = (mentor: MentorProfile) => {
    // Open the mentor profile dialog
    window.history.pushState({}, '', `/mentor?dialog=true&profileId=${mentor.id}`);
    // Dispatch a custom event to open the mentor profile dialog
    window.dispatchEvent(new CustomEvent('openMentorProfile', { detail: mentor.id }));
  };

  const renderMentorCard = (mentor: MentorProfile, onView: (mentor: MentorProfile) => void) => (
    <div
      key={mentor.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(mentor)}
    >
      <div className="flex p-4 items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          {mentor.avatar_url ? (
            <img src={mentor.avatar_url} alt={mentor.full_name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="font-semibold text-base truncate">{mentor.full_name}</h3>
          <p className="text-sm text-muted-foreground truncate">
            {mentor.position}
            {mentor.company_name && ` at ${mentor.company_name}`}
          </p>
          {mentor.location && (
            <p className="text-xs text-muted-foreground truncate">{mentor.location}</p>
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
        icon: <User className="h-6 w-6 text-primary" />,
        linkPath: "/mentor",
        type: "mentors"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={handleViewMentor}
      renderCard={renderMentorCard}
      bookmarkType="mentor"
    />
  );
}
