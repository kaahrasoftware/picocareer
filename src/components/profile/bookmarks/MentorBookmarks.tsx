
import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { BookmarksList } from "./BookmarksList";
import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MentorProfile } from "./types";

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
            position,
            company_id,
            location,
            bio
          ),
          companies(name)
        `)
        .eq('profile_id', userId)
        .eq('content_type', 'mentor')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedBookmarks = bookmarks.map(bookmark => ({
        id: bookmark.content_id,
        full_name: bookmark.profiles.full_name,
        avatar_url: bookmark.profiles.avatar_url,
        position: bookmark.profiles.position,
        company_name: bookmark.companies?.name,
        location: bookmark.profiles.location,
        bio: bookmark.profiles.bio
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
    window.history.pushState({}, '', `/mentor?dialog=true&profileId=${mentor.id}`);
    window.dispatchEvent(new CustomEvent('openMentorProfile', { detail: mentor.id }));
  };

  const renderMentorCard = (mentor: MentorProfile, onView: (mentor: MentorProfile) => void) => (
    <div
      key={mentor.id}
      className="cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onView(mentor)}
    >
      <div className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={mentor.avatar_url || ''} alt={mentor.full_name} />
            <AvatarFallback>
              {mentor.full_name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base">{mentor.full_name}</h3>
            {mentor.position && (
              <p className="text-sm text-muted-foreground">
                {mentor.position} {mentor.company_name ? `at ${mentor.company_name}` : ''}
              </p>
            )}
          </div>
        </div>
        
        {mentor.location && (
          <div className="text-sm mt-2">
            <span className="font-medium">Location:</span>{" "}
            <span className="text-muted-foreground">{mentor.location}</span>
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
