
import React from "react";
import { BookmarksList } from "./BookmarksList";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface MentorBookmarksProps {
  bookmarkIds: string[];
  isLoading: boolean;
}

export function MentorBookmarks({ bookmarkIds, isLoading }: MentorBookmarksProps) {
  const { data: mentors = [], isLoading: mentorsLoading } = useQuery({
    queryKey: ['bookmarked-mentors', bookmarkIds],
    queryFn: async () => {
      if (bookmarkIds.length === 0) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', bookmarkIds)
        .eq('user_type', 'mentor');
      
      if (error) throw error;
      return data;
    },
    enabled: bookmarkIds.length > 0,
  });

  return (
    <BookmarksList
      items={mentors}
      isLoading={isLoading || mentorsLoading}
      emptyMessage="No mentor bookmarks yet"
      renderItem={(mentor, handleView) => (
        <Card key={mentor.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-3">
              <Avatar>
                <AvatarImage src={mentor.avatar_url} />
                <AvatarFallback>
                  {mentor.first_name?.[0]}{mentor.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{mentor.full_name || `${mentor.first_name} ${mentor.last_name}`}</h3>
                <p className="text-sm text-muted-foreground">{mentor.position || 'Mentor'}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {mentor.bio || 'Professional mentor ready to help with your career journey.'}
            </p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                {mentor.years_of_experience || 0}+ years experience
              </span>
              <button 
                onClick={() => handleView(mentor)}
                className="text-primary hover:underline text-sm"
              >
                View Profile
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    />
  );
}
