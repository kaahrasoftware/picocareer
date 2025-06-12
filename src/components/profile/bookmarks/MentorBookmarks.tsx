
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bookmark, MapPin, Building, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BookmarksList } from "./BookmarksList";
import { MentorProfile, MentorBookmarksProps } from "./types";

export function MentorBookmarks({ activePage, onViewMentorProfile }: MentorBookmarksProps) {
  const { session } = useAuthSession();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  const { data: bookmarksData, isLoading } = useQuery({
    queryKey: ['mentor-bookmarks', session?.user?.id, currentPage],
    queryFn: async () => {
      if (!session?.user?.id) return { data: [], count: 0 };
      
      const { count, error: countError } = await supabase
        .from('user_bookmarks')
        .select('*', { count: 'exact' })
        .eq('profile_id', session.user.id)
        .eq('content_type', 'mentor');

      if (countError) throw countError;

      const start = (currentPage - 1) * PAGE_SIZE;
      const end = start + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          id,
          content_id,
          profiles!inner (
            id,
            first_name,
            last_name,
            full_name,
            avatar_url,
            user_type,
            position,
            bio,
            company_id,
            location,
            skills,
            top_mentor,
            companies (name)
          )
        `)
        .eq('profile_id', session.user.id)
        .eq('content_type', 'mentor')
        .eq('profiles.user_type', 'mentor')
        .range(start, end);

      if (error) throw error;

      const mentors: MentorProfile[] = (data || []).map(bookmark => ({
        id: bookmark.profiles?.id || bookmark.content_id,
        first_name: bookmark.profiles?.first_name || '',
        last_name: bookmark.profiles?.last_name || '',
        full_name: bookmark.profiles?.full_name || 'Unknown Mentor',
        avatar_url: bookmark.profiles?.avatar_url || '',
        user_type: bookmark.profiles?.user_type || '',
        position: bookmark.profiles?.position || '',
        bio: bookmark.profiles?.bio || '',
        company_id: bookmark.profiles?.company_id || '',
        location: bookmark.profiles?.location || '',
        skills: bookmark.profiles?.skills || [],
        top_mentor: bookmark.profiles?.top_mentor || false,
        company_name: bookmark.profiles?.companies?.name || '',
        career_title: bookmark.profiles?.position || '',
        bookmark_id: bookmark.id
      }));

      return { data: mentors, count: count || 0 };
    },
    enabled: !!session?.user?.id && activePage === 'mentors',
  });

  const bookmarks = bookmarksData?.data || [];
  const totalCount = bookmarksData?.count || 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const renderMentorCard = (mentor: MentorProfile) => (
    <Card key={mentor.id} className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mentor.avatar_url} alt={mentor.full_name} />
            <AvatarFallback>
              {mentor.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg line-clamp-1">{mentor.full_name}</CardTitle>
              {mentor.top_mentor && <Star className="h-4 w-4 text-yellow-500" />}
            </div>
            {mentor.position && (
              <p className="text-sm text-muted-foreground">{mentor.position}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {mentor.company_name && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
            <Building className="h-3 w-3" />
            {mentor.company_name}
          </p>
        )}
        {mentor.location && (
          <p className="text-sm text-muted-foreground flex items-center gap-1 mb-3">
            <MapPin className="h-3 w-3" />
            {mentor.location}
          </p>
        )}
        {mentor.bio && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {mentor.bio}
          </p>
        )}
        <div className="flex items-center justify-between">
          {mentor.skills && mentor.skills.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {mentor.skills.length} skills
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={() => onViewMentorProfile(mentor)}>
            View Profile
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
        linkPath: "/community",
        type: "mentors"
      }}
      totalPages={totalPages}
      currentPage={currentPage}
      setPage={setCurrentPage}
      onViewDetails={onViewMentorProfile}
      renderCard={renderMentorCard}
      bookmarkType="mentor"
    />
  );
}
