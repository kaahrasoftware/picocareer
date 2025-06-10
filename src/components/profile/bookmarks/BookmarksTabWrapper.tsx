
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { ScholarshipBookmarks } from './ScholarshipBookmarks';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function BookmarksTabWrapper() {
  const { session } = useAuthSession();
  const userId = session?.user?.id;

  const { data: bookmarkedScholarships = [], isLoading } = useQuery({
    queryKey: ['bookmarked-scholarships', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // Simple query for now to avoid column issues
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select('*')
        .eq('user_id', userId)
        .eq('bookmark_type', 'scholarship');

      if (error) throw error;
      
      return data || [];
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="scholarships" className="w-full">
      <TabsList>
        <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        <TabsTrigger value="events">Events</TabsTrigger>
      </TabsList>

      <TabsContent value="scholarships">
        <ScholarshipBookmarks scholarships={bookmarkedScholarships} />
      </TabsContent>

      <TabsContent value="opportunities">
        <div className="text-center py-8 text-muted-foreground">
          Opportunity bookmarks coming soon
        </div>
      </TabsContent>

      <TabsContent value="events">
        <div className="text-center py-8 text-muted-foreground">
          Event bookmarks coming soon
        </div>
      </TabsContent>
    </Tabs>
  );
}
