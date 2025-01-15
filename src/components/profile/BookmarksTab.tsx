import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkX } from "lucide-react";
import { ProfileAvatar } from "@/components/ui/profile-avatar";
import { ProfileDetailsDialog } from "@/components/ProfileDetailsDialog";

export function BookmarksTab() {
  const { session } = useAuthSession();
  const [selectedProfile, setSelectedProfile] = React.useState<string | null>(null);

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        // First get the user's bookmarks
        const { data: bookmarkData, error: bookmarkError } = await supabase
          .from('user_bookmarks')
          .select('content_type, content_id')
          .eq('profile_id', session.user.id)
          .eq('content_type', 'mentor');

        if (bookmarkError) {
          console.error('Error fetching bookmarks:', bookmarkError);
          return null;
        }

        if (!bookmarkData || bookmarkData.length === 0) return { mentor: [] };

        // Get the mentor profiles for the bookmarked mentor IDs
        const mentorIds = bookmarkData.map(b => b.content_id);
        const { data: mentorData, error: mentorError } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            avatar_url,
            position,
            user_type,
            company:companies(name),
            careers!profiles_position_fkey(title)
          `)
          .in('id', mentorIds)
          .eq('user_type', 'mentor')
          .eq('onboarding_status', 'Approved');

        if (mentorError) {
          console.error('Error fetching mentor profiles:', mentorError);
          return null;
        }

        return { mentor: mentorData || [] };
      } catch (error) {
        console.error('Error in bookmark query:', error);
        return null;
      }
    },
    enabled: !!session?.user?.id,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  if (!bookmarks || Object.keys(bookmarks).length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
        <div className="text-muted-foreground flex flex-col items-center justify-center py-8">
          <BookmarkX className="h-12 w-12 mb-4 text-muted-foreground/50" />
          <p>No bookmarks yet. Your saved items will appear here.</p>
        </div>
      </Card>
    );
  }

  const mentors = bookmarks.mentor || [];

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mentors.map((mentor) => (
          <Card 
            key={mentor.id} 
            className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => setSelectedProfile(mentor.id)}
          >
            <div className="flex flex-col items-center text-center">
              <ProfileAvatar
                avatarUrl={mentor.avatar_url}
                fallback={mentor.full_name?.charAt(0) || '?'}
                size="md"
              />
              <h3 className="font-semibold text-lg mt-3 mb-1">
                {mentor.full_name}
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {mentor.careers?.title || 'No position set'} | {mentor.company?.name || 'No company set'}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {selectedProfile && (
        <ProfileDetailsDialog
          userId={selectedProfile}
          open={!!selectedProfile}
          onOpenChange={(open) => !open && setSelectedProfile(null)}
        />
      )}
    </Card>
  );
}