
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen, Calendar, Filter } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, subDays, subMonths, isAfter } from "date-fns";

interface ProfileContentTabProps {
  profileId: string;
}

type ContentType = "blogs" | "hub_resources" | "all";
type TimeFilter = "all" | "week" | "month" | "3months";

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const [contentType, setContentType] = useState<ContentType>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [activeTab, setActiveTab] = useState("all");

  // Function to get date threshold based on time filter
  const getDateThreshold = (filter: TimeFilter): Date | null => {
    const now = new Date();
    switch (filter) {
      case "week": return subDays(now, 7);
      case "month": return subMonths(now, 1);
      case "3months": return subMonths(now, 3);
      default: return null;
    }
  };

  // Blogs query
  const { data: blogs, isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['profile-blogs', profileId, timeFilter],
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

  // Resources query
  const { data: resources, isLoading: isLoadingResources } = useQuery({
    queryKey: ['profile-resources', profileId, timeFilter],
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

  // Apply time filter to content
  const filterContentByTime = (items: any[] = []) => {
    if (timeFilter === "all") return items;
    
    const threshold = getDateThreshold(timeFilter);
    if (!threshold) return items;
    
    return items.filter(item => {
      const itemDate = new Date(item.created_at);
      return isAfter(itemDate, threshold);
    });
  };

  // Filtered content
  const filteredBlogs = filterContentByTime(blogs);
  const filteredResources = filterContentByTime(resources);

  // Get all content combined and sorted by date
  const allContent = [...(filteredBlogs || []), ...(filteredResources || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Get content to display based on selected type
  const getContentToDisplay = () => {
    switch (contentType) {
      case "blogs": return filteredBlogs;
      case "hub_resources": return filteredResources;
      default: return allContent;
    }
  };

  const isLoading = isLoadingBlogs || isLoadingResources;
  const contentToDisplay = getContentToDisplay();

  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2 py-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
          <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="all" className="flex items-center gap-1" onClick={() => setContentType("all")}>
                <Calendar className="h-4 w-4" />
                All Content
              </TabsTrigger>
              <TabsTrigger value="blogs" className="flex items-center gap-1" onClick={() => setContentType("blogs")}>
                <BookOpen className="h-4 w-4" />
                Blogs
              </TabsTrigger>
              <TabsTrigger value="resources" className="flex items-center gap-1" onClick={() => setContentType("hub_resources")}>
                <FileText className="h-4 w-4" />
                Resources
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filter by Time
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Time Period</h4>
                  <Select 
                    value={timeFilter} 
                    onValueChange={(value) => setTimeFilter(value as TimeFilter)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="3months">Past 3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
          
        <TabsContent value="all" className="mt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full hidden sm:block" />
              <Skeleton className="h-32 w-full hidden sm:block" />
            </>
          ) : contentToDisplay && contentToDisplay.length > 0 ? (
            contentToDisplay.map((item) => {
              const isResource = 'type' in item;
              const contentType = isResource ? 'Resource' : 'Blog';
              const category = isResource ? item.type : item.category;
              
              return (
                <Card key={item.id} className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base truncate">{item.title}</CardTitle>
                      <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                        {contentType}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {isResource ? item.description : item.summary}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{category}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-8 col-span-full">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-muted-foreground">No content found</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="blogs" className="mt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full hidden sm:block" />
              <Skeleton className="h-32 w-full hidden sm:block" />
            </>
          ) : contentType === "all" || contentType === "blogs" ? (
            filteredBlogs && filteredBlogs.length > 0 ? (
              filteredBlogs.map((blog) => (
                <Card key={blog.id} className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base truncate">{blog.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{blog.summary}</p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{blog.category}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 col-span-full">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No blogs published yet</p>
              </div>
            )
          ) : null}
        </TabsContent>
          
        <TabsContent value="resources" className="mt-0 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full hidden sm:block" />
              <Skeleton className="h-32 w-full hidden sm:block" />
            </>
          ) : contentType === "all" || contentType === "hub_resources" ? (
            filteredResources && filteredResources.length > 0 ? (
              filteredResources.map((resource) => (
                <Card key={resource.id} className="overflow-hidden h-full hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base truncate">{resource.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{resource.description}</p>
                    <div className="flex justify-between items-center mt-auto pt-2 border-t border-border/30">
                      <span className="text-xs text-muted-foreground">{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{resource.type}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 col-span-full">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-muted-foreground">No resources shared yet</p>
              </div>
            )
          ) : null}
        </TabsContent>
      </div>
    </ScrollArea>
  );
}
