
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, BookOpen, Calendar, Filter, Search, SortDesc, Video, Image, File, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format, subDays, subMonths, isAfter } from "date-fns";
import { Input } from "@/components/ui/input";
import { ContentManagementDropdown } from "./content/ContentManagementDropdown";
import { ContentEmptyState } from "./content/ContentEmptyState";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";

interface ProfileContentTabProps {
  profileId: string;
}

type ContentType = "blogs" | "hub_resources" | "mentor_resources" | "all";
type TimeFilter = "all" | "week" | "month" | "3months";

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const [activeTab, setActiveTab] = useState("all");
  const [contentType, setContentType] = useState<ContentType>("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { session } = useAuthSession();
  
  // Check if the current user is viewing their own profile
  const isOwnProfile = session?.user?.id === profileId;

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

  // Blogs query - using fixed table name instead of dynamic variable
  const { data: blogs = [], isLoading: isLoadingBlogs } = useQuery({
    queryKey: ['profile-blogs', profileId, timeFilter],
    queryFn: async () => {
      console.log('Fetching blogs for profile:', profileId);
      
      // Build the query - for non-owners, only show published content
      let query = supabase
        .from('blogs')
        .select('*')
        .eq('author_id', profileId);
      
      // If not the owner, only show public content
      if (!isOwnProfile) {
        query = query.eq('status', 'Published');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} blogs for profile ${profileId}`);
      return data || [];
    },
    enabled: !!profileId,
  });

  // Hub Resources query - using fixed table name instead of dynamic variable
  const { data: hubResources = [], isLoading: isLoadingHubResources } = useQuery({
    queryKey: ['profile-hub-resources', profileId, timeFilter],
    queryFn: async () => {
      console.log('Fetching hub resources for profile:', profileId);
      
      // Build the query - for non-owners, only show published content
      let query = supabase
        .from('hub_resources')
        .select('*')
        .eq('created_by', profileId);
      
      // If not the owner, only show public content
      if (!isOwnProfile) {
        query = query.eq('status', 'Published');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching hub resources:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} hub resources for profile ${profileId}`);
      return data || [];
    },
    enabled: !!profileId,
  });

  // Mentor Resources query - using fixed table name instead of dynamic variable
  const { data: mentorResources = [], isLoading: isLoadingMentorResources } = useQuery({
    queryKey: ['profile-mentor-resources', profileId, timeFilter],
    queryFn: async () => {
      console.log('Fetching mentor resources for profile:', profileId);
      
      // Build the query - for non-owners, only show published content
      let query = supabase
        .from('mentor_resources')
        .select('*')
        .eq('mentor_id', profileId);
      
      // If not the owner, only show public content
      if (!isOwnProfile) {
        query = query.eq('status', 'Published');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching mentor resources:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} mentor resources for profile ${profileId}`);
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

  // Apply search filter to content
  const filterContentBySearch = (items: any[] = []) => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      (item.title && item.title.toLowerCase().includes(query)) || 
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.content && item.content.toLowerCase().includes(query)) ||
      (item.summary && item.summary.toLowerCase().includes(query))
    );
  };

  // Filtered content
  const filteredBlogs = filterContentBySearch(filterContentByTime(blogs));
  const filteredHubResources = filterContentBySearch(filterContentByTime(hubResources));
  const filteredMentorResources = filterContentBySearch(filterContentByTime(mentorResources));

  // Get all content combined and sorted by date
  const allContent = [...(filteredBlogs || []), ...(filteredHubResources || []), ...(filteredMentorResources || [])]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Get content to display based on selected type
  const getContentToDisplay = () => {
    switch (contentType) {
      case "blogs": return filteredBlogs;
      case "hub_resources": return filteredHubResources;
      case "mentor_resources": return filteredMentorResources;
      default: return allContent;
    }
  };

  const handleManageContent = async (action: string, item: any, contentTableName: string) => {
    // Only allow content management for authenticated users who own the content
    if (!session || session.user.id !== profileId) {
      toast({
        title: "Unauthorized",
        description: "You must be signed in and own this content to manage it.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log(`Managing ${contentTableName} action:`, action, 'item:', item.id);
      
      switch (action) {
        case "delete":
          if (window.confirm("Are you sure you want to delete this content? This action cannot be undone.")) {
            const { error } = await supabase
              .from(contentTableName)
              .delete()
              .eq('id', item.id);
            
            if (error) throw error;
            
            toast({
              title: "Content deleted",
              description: "Your content has been successfully deleted.",
            });
          }
          break;
          
        case "hide":
          const { error: hideError } = await supabase
            .from(contentTableName)
            .update({ status: "Hidden" })
            .eq('id', item.id);
          
          if (hideError) throw hideError;
          
          toast({
            title: "Content hidden",
            description: "Your content is now hidden from public view.",
          });
          break;
          
        case "show":
          const { error: showError } = await supabase
            .from(contentTableName)
            .update({ status: "Published" })
            .eq('id', item.id);
          
          if (showError) throw showError;
          
          toast({
            title: "Content published",
            description: "Your content is now visible to the public.",
          });
          break;
      }
    } catch (error) {
      console.error("Error managing content:", error);
      toast({
        title: "Error",
        description: "There was a problem performing that action. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = isLoadingBlogs || isLoadingHubResources || isLoadingMentorResources;
  const contentToDisplay = getContentToDisplay();

  // Function to get icon based on content type
  const getContentIcon = (item: any) => {
    // For blogs
    if ('summary' in item) return <BookOpen className="h-5 w-5 text-primary" />;
    
    // For hub_resources
    if ('resource_type' in item && 'file_url' in item) {
      const resourceType = item.resource_type;
      if (resourceType === 'document') return <FileText className="h-5 w-5 text-blue-500" />;
      if (resourceType === 'image') return <Image className="h-5 w-5 text-green-500" />;
      if (resourceType === 'video') return <Video className="h-5 w-5 text-red-500" />;
      if (resourceType === 'link') return <ExternalLink className="h-5 w-5 text-purple-500" />;
    }
    
    // For mentor_resources
    if ('resource_type' in item && !('file_url' in item)) {
      const resourceType = item.resource_type;
      if (resourceType === 'text') return <FileText className="h-5 w-5 text-blue-500" />;
      if (resourceType === 'document') return <File className="h-5 w-5 text-amber-500" />;
      if (resourceType === 'image') return <Image className="h-5 w-5 text-green-500" />;
      if (resourceType === 'video') return <Video className="h-5 w-5 text-red-500" />;
      if (resourceType === 'audio') return <FileText className="h-5 w-5 text-violet-500" />;
      if (resourceType === 'link') return <ExternalLink className="h-5 w-5 text-purple-500" />;
    }
    
    // Default icon
    return <FileText className="h-5 w-5 text-muted-foreground" />;
  };

  // Determine content type text for display
  const getContentTypeText = (item: any): string => {
    if ('summary' in item) return 'Blog';
    if ('resource_type' in item && 'file_url' in item) {
      return `Hub ${item.resource_type.charAt(0).toUpperCase() + item.resource_type.slice(1)}`;
    }
    if ('resource_type' in item && !('file_url' in item)) {
      return `${item.resource_type.charAt(0).toUpperCase() + item.resource_type.slice(1)} Post`;
    }
    return 'Content';
  };

  // Determine database table for each content type
  const getContentTable = (item: any): string => {
    if ('summary' in item) return 'blogs';
    if ('resource_type' in item && 'file_url' in item) return 'hub_resources';
    if ('resource_type' in item && !('file_url' in item)) return 'mentor_resources';
    return '';
  };

  return (
    <ScrollArea className="h-full">
      <div className="px-1 sm:px-2 py-4">
        <div className="flex flex-col space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Tabs defaultValue="all" className="w-full" value={activeTab} onValueChange={(value) => {
              setActiveTab(value);
              setContentType(value as ContentType);
            }}>
              <TabsList className="w-full sm:w-auto">
                <TabsTrigger value="all" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  All Content
                </TabsTrigger>
                <TabsTrigger value="blogs" className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  Blogs
                </TabsTrigger>
                <TabsTrigger value="hub_resources" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Hub Resources
                </TabsTrigger>
                <TabsTrigger value="mentor_resources" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Posts
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-full sm:w-auto flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search content..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="flex-shrink-0">
                    <Filter className="h-4 w-4 mr-2" />
                    {timeFilter === "all" ? "All Time" : 
                     timeFilter === "week" ? "Past Week" : 
                     timeFilter === "month" ? "Past Month" : "Past 3 Months"}
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

              <Button variant="outline" size="sm" className="flex-shrink-0">
                <SortDesc className="h-4 w-4 mr-2" />
                Newest
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : contentToDisplay && contentToDisplay.length > 0 ? (
            <div className="space-y-4">
              {contentToDisplay.map((item) => {
                const contentTypeText = getContentTypeText(item);
                const contentTableName = getContentTable(item);
                
                return (
                  <Card key={item.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="flex-1">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-muted">
                              {getContentIcon(item)}
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>{format(new Date(item.created_at), 'MMM d, yyyy')}</span>
                                <span className="mx-1.5">•</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {contentTypeText}
                                </Badge>
                                {item.status && item.status !== "Published" && isOwnProfile && (
                                  <>
                                    <span className="mx-1.5">•</span>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {item.status}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <ContentManagementDropdown 
                              item={item} 
                              contentType={contentTableName} 
                              onAction={(action) => handleManageContent(action, item, contentTableName)}
                            />
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {item.description || item.summary || "No description available"}
                          </p>
                          {item.categories && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Array.isArray(item.categories) ? 
                                item.categories.map((category: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {category}
                                  </Badge>
                                )) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {item.categories}
                                  </Badge>
                                )
                              }
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <ContentEmptyState contentType={contentType} />
          )}
        </TabsContent>
        
        <TabsContent value="blogs" className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : contentType === "all" || contentType === "blogs" ? (
            filteredBlogs && filteredBlogs.length > 0 ? (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <Card key={blog.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="flex-1">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-muted">
                              <BookOpen className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">{blog.title}</CardTitle>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>{format(new Date(blog.created_at), 'MMM d, yyyy')}</span>
                                <span className="mx-1.5">•</span>
                                <Badge variant="outline" className="text-xs h-5">Blog</Badge>
                                {blog.status && blog.status !== "Published" && isOwnProfile && (
                                  <>
                                    <span className="mx-1.5">•</span>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {blog.status}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <ContentManagementDropdown 
                              item={blog} 
                              contentType="blogs" 
                              onAction={(action) => handleManageContent(action, blog, "blogs")}
                            />
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{blog.summary}</p>
                          {blog.categories && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Array.isArray(blog.categories) ? 
                                blog.categories.map((category: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {category}
                                  </Badge>
                                )) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {blog.categories}
                                  </Badge>
                                )
                              }
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <ContentEmptyState contentType="blogs" />
            )
          ) : null}
        </TabsContent>
          
        {/* Similar pattern for hub_resources and mentor_resources tabs */}
        <TabsContent value="hub_resources" className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : contentType === "all" || contentType === "hub_resources" ? (
            filteredHubResources && filteredHubResources.length > 0 ? (
              <div className="space-y-4">
                {filteredHubResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="flex-1">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-muted">
                              {resource.resource_type === 'document' && <FileText className="h-5 w-5 text-blue-500" />}
                              {resource.resource_type === 'image' && <Image className="h-5 w-5 text-green-500" />}
                              {resource.resource_type === 'video' && <Video className="h-5 w-5 text-red-500" />}
                              {resource.resource_type === 'link' && <ExternalLink className="h-5 w-5 text-purple-500" />}
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">{resource.title}</CardTitle>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                <span className="mx-1.5">•</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  Hub {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)}
                                </Badge>
                                {resource.status && resource.status !== "Published" && isOwnProfile && (
                                  <>
                                    <span className="mx-1.5">•</span>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {resource.status}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <ContentManagementDropdown 
                              item={resource} 
                              contentType="hub_resources" 
                              onAction={(action) => handleManageContent(action, resource, "hub_resources")}
                            />
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{resource.description}</p>
                          {resource.category && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {resource.category}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <ContentEmptyState contentType="hub_resources" />
            )
          ) : null}
        </TabsContent>

        <TabsContent value="mentor_resources" className="mt-0 space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : contentType === "all" || contentType === "mentor_resources" ? (
            filteredMentorResources && filteredMentorResources.length > 0 ? (
              <div className="space-y-4">
                {filteredMentorResources.map((resource) => (
                  <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="flex">
                      <div className="flex-1">
                        <CardHeader className="flex flex-row items-start justify-between pb-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 p-1.5 rounded-md bg-muted">
                              {resource.resource_type === 'text' && <FileText className="h-5 w-5 text-blue-500" />}
                              {resource.resource_type === 'document' && <File className="h-5 w-5 text-amber-500" />}
                              {resource.resource_type === 'image' && <Image className="h-5 w-5 text-green-500" />}
                              {resource.resource_type === 'video' && <Video className="h-5 w-5 text-red-500" />}
                              {resource.resource_type === 'audio' && <FileText className="h-5 w-5 text-violet-500" />}
                              {resource.resource_type === 'link' && <ExternalLink className="h-5 w-5 text-purple-500" />}
                            </div>
                            <div>
                              <CardTitle className="text-base line-clamp-1">{resource.title}</CardTitle>
                              <div className="flex items-center mt-1 text-xs text-muted-foreground">
                                <span>{format(new Date(resource.created_at), 'MMM d, yyyy')}</span>
                                <span className="mx-1.5">•</span>
                                <Badge variant="outline" className="text-xs h-5">
                                  {resource.resource_type.charAt(0).toUpperCase() + resource.resource_type.slice(1)} Post
                                </Badge>
                                {resource.status && resource.status !== "Published" && isOwnProfile && (
                                  <>
                                    <span className="mx-1.5">•</span>
                                    <Badge variant="secondary" className="text-xs h-5">
                                      {resource.status}
                                    </Badge>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          {isOwnProfile && (
                            <ContentManagementDropdown 
                              item={resource} 
                              contentType="mentor_resources" 
                              onAction={(action) => handleManageContent(action, resource, "mentor_resources")}
                            />
                          )}
                        </CardHeader>
                        <CardContent className="pt-0 pb-4">
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {resource.description || (resource.hashtags ? resource.hashtags.join(', ') : 'No description')}
                          </p>
                          {resource.categories && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {Array.isArray(resource.categories) ? 
                                resource.categories.map((category: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {category}
                                  </Badge>
                                )) : (
                                  <Badge variant="secondary" className="text-xs">
                                    {resource.categories}
                                  </Badge>
                                )
                              }
                            </div>
                          )}
                        </CardContent>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <ContentEmptyState contentType="mentor_resources" />
            )
          ) : null}
        </TabsContent>
      </div>
    </ScrollArea>
  );
}
