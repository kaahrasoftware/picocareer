import React from "react";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuthSession } from "@/hooks/useAuthSession";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { BookmarkX } from "lucide-react";

export function BookmarksTab() {
  const { session } = useAuthSession();

  const { data: bookmarks, isLoading } = useQuery({
    queryKey: ['bookmarks', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return null;

      try {
        // First get all bookmarks for the user
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

        // Group bookmarks by type for separate queries
        const mentorIds = data.filter(b => b.content_type === 'mentor').map(b => b.content_id);
        const careerIds = data.filter(b => b.content_type === 'career').map(b => b.content_id);
        const majorIds = data.filter(b => b.content_type === 'major').map(b => b.content_id);

        // Fetch mentor profiles
        const mentorPromise = mentorIds.length > 0 ? 
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url, position, user_type')
            .in('id', mentorIds) : 
          Promise.resolve({ data: [] });

        // Fetch careers
        const careerPromise = careerIds.length > 0 ?
          supabase
            .from('careers')
            .select('id, title, description')
            .in('id', careerIds) :
          Promise.resolve({ data: [] });

        // Fetch majors
        const majorPromise = majorIds.length > 0 ?
          supabase
            .from('majors')
            .select('id, title, description')
            .in('id', majorIds) :
          Promise.resolve({ data: [] });

        // Wait for all queries to complete
        const [mentorResult, careerResult, majorResult] = await Promise.all([
          mentorPromise,
          careerPromise,
          majorPromise
        ]);

        // Group results by type
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
          <TabsContent key={type} value={type} className="space-y-4">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <h3 className="font-semibold text-lg mb-2">
                  {type === 'mentor' ? item.full_name : item.title}
                </h3>
                {type === 'mentor' ? (
                  <p className="text-muted-foreground">
                    {item.user_type === 'mentor' ? 'Mentor' : 'User'}
                  </p>
                ) : (
                  <p className="text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
}