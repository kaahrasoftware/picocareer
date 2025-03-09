
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileContentTabProps {
  profileId: string;
}

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['profile-blogs', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('author_id', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });

  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['profile-resources', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hub_resources')
        .select('*')
        .eq('uploaded_by', profileId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profileId,
  });

  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2 py-4">
        <Tabs defaultValue="blogs" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="blogs" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Blogs
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Resources
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="blogs" className="mt-0">
            {isLoadingBlogs ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : blogs && blogs.length > 0 ? (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{blog.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{blog.summary}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">{new Date(blog.created_at).toLocaleDateString()}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{blog.category}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No blogs published yet</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="resources" className="mt-0">
            {isLoadingResources ? (
              <div className="space-y-4">
                <Skeleton className="h-28 w-full" />
                <Skeleton className="h-28 w-full" />
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-base">{resource.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">{new Date(resource.created_at).toLocaleDateString()}</span>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{resource.type}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No resources shared yet</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
}
