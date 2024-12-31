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
        const { data, error } = await supabase
          .from('user_bookmarks')
          .select(`
            id,
            content_type,
            content_id
          `)
          .eq('profile_id', session.user.id);

        if (error) {
          console.error('Error fetching bookmarks:', error);
          return null;
        }

        if (!data || data.length === 0) return {};

        const mentorIds = data.filter(b => b.content_type === 'mentor').map(b => b.content_id);
        const careerIds = data.filter(b => b.content_type === 'career').map(b => b.content_id);
        const majorIds = data.filter(b => b.content_type === 'major').map(b => b.content_id);

        const mentorPromise = mentorIds.length > 0 ? 
          supabase
            .from('profiles')
            .select(`
              id, 
              full_name, 
              avatar_url, 
              position,
              user_type,
              company:companies(name)
            `)
            .in('id', mentorIds) : 
          Promise.resolve({ data: [] });

        const careerPromise = careerIds.length > 0 ?
          supabase
            .from('careers')
            .select('id, title, description')
            .in('id', careerIds) :
          Promise.resolve({ data: [] });

        const majorPromise = majorIds.length > 0 ?
          supabase
            .from('majors')
            .select('id, title, description')
            .in('id', majorIds) :
          Promise.resolve({ data: [] });

        const [mentorResult, careerResult, majorResult] = await Promise.all([
          mentorPromise,
          careerPromise,
          majorPromise
        ]);

        const grouped: any = {};
        
        if (mentorResult.data && mentorResult.data.length > 0) {
          grouped.mentor = mentorResult.data;
        }
        
        if (careerResult.data && careerResult.data.length > 0) {
          grouped.career = careerResult.data;
        }
        
        if (majorResult.data && majorResult.data.length > 0) {
          grouped.major = majorResult.data;
        }

        return grouped;
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

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Bookmarks</h2>
      <Tabs defaultValue={Object.keys(bookmarks)[0]} className="w-full">
        <TabsList className="w-full justify-start mb-6">
          {Object.keys(bookmarks).map((type) => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type}s ({bookmarks[type].length})
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(bookmarks).map(([type, items]: [string, any[]]) => (
          <TabsContent key={type} value={type}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {items.map((item) => (
                <Card 
                  key={item.id} 
                  className={`p-4 ${type === 'mentor' ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                  onClick={() => type === 'mentor' && setSelectedProfile(item.id)}
                >
                  {type === 'mentor' ? (
                    <div className="flex flex-col items-center text-center">
                      <ProfileAvatar
                        avatarUrl={item.avatar_url}
                        fallback={item.full_name?.charAt(0) || '?'}
                        size="md"
                      />
                      <h3 className="font-semibold text-lg mt-3 mb-1">
                        {item.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.position ? bookmarks.careers?.find((c: any) => c.id === item.position)?.title : 'No position set'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item.company?.name || 'No company set'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-semibold text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    </>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {selectedProfile && (
        <ProfileDetailsDialog
          profileId={selectedProfile}
          onClose={() => setSelectedProfile(null)}
        />
      )}
    </Card>
  );
}