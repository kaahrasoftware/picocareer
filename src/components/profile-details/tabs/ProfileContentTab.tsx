
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { BlogPostDialog } from "@/components/blog/BlogPostDialog";
import { format } from "date-fns";
import { BlogWithAuthor } from "@/types/blog/types";

interface ProfileContentTabProps {
  profileId: string;
}

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const [selectedBlog, setSelectedBlog] = useState<BlogWithAuthor | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  
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

  const handleOpenBlog = (blog: BlogWithAuthor) => {
    setSelectedBlog(blog);
  };

  const handleOpenResource = (resource: any) => {
    setSelectedResource(resource);
  };

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
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : blogs && blogs.length > 0 ? (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <Card 
                    key={blog.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => handleOpenBlog(blog as BlogWithAuthor)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48">
                        <img 
                          src={blog.cover_image_url || `https://picsum.photos/seed/${blog.id}/400/300`} 
                          alt={blog.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{blog.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">{blog.summary}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-muted-foreground">{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                            {blog.categories && blog.categories[0] && (
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                {blog.categories[0]}
                              </span>
                            )}
                          </div>
                        </CardContent>
                      </div>
                    </div>
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
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
            ) : resources && resources.length > 0 ? (
              <div className="space-y-4">
                {resources.map((resource) => (
                  <Card 
                    key={resource.id} 
                    className="overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => handleOpenResource(resource)}
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-1/3 h-48 bg-muted flex items-center justify-center">
                        {resource.thumbnail_url ? (
                          <img 
                            src={resource.thumbnail_url} 
                            alt={resource.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FileText className="h-16 w-16 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="md:w-2/3">
                        <CardHeader className="p-4">
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
                          <div className="flex justify-between items-center mt-4">
                            <span className="text-xs text-muted-foreground">{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{resource.content_type}</span>
                          </div>
                        </CardContent>
                      </div>
                    </div>
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

      {/* Blog post dialog */}
      {selectedBlog && (
        <BlogPostDialog
          blog={selectedBlog}
          isOpen={!!selectedBlog}
          onClose={() => setSelectedBlog(null)}
        />
      )}

      {/* Resource dialog - we'd need to implement this component */}
      {/* {selectedResource && (
        <ResourceViewDialog
          resource={selectedResource}
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
        />
      )} */}
    </ScrollArea>
  );
}
