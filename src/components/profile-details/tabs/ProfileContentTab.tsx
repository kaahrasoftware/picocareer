import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Image, Video, ExternalLink, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface ProfileContentTabProps {
  profileId: string;
}

interface BlogItem {
  id: string;
  title: string;
  summary: string;
  categories: string[];
  created_at: string;
  status: string;
  cover_image_url?: string;
}

interface HubResource {
  id: string;
  title: string;
  description?: string;
  resource_type: string;
  created_at: string;
  file_url?: string;
  external_url?: string;
}

interface MentorContent {
  id: string;
  title: string;
  description?: string;
  content_type: string;
  created_at: string;
  file_url?: string;
  external_url?: string;
}

export function ProfileContentTab({ profileId }: ProfileContentTabProps) {
  const { data: blogs = [], isLoading: blogsLoading } = useQuery({
    queryKey: ['profile-blogs', profileId],
    queryFn: async (): Promise<BlogItem[]> => {
      const { data, error } = await supabase
        .from('blogs')
        .select('id, title, summary, categories, created_at, status, cover_image_url')
        .eq('author_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: hubResources = [], isLoading: hubResourcesLoading } = useQuery({
    queryKey: ['profile-hub-resources', profileId],
    queryFn: async (): Promise<HubResource[]> => {
      const { data, error } = await supabase
        .from('hub_resources')
        .select('id, title, description, resource_type, created_at, file_url, external_url')
        .eq('created_by', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: mentorContent = [], isLoading: mentorContentLoading } = useQuery({
    queryKey: ['profile-mentor-content', profileId],
    queryFn: async (): Promise<MentorContent[]> => {
      const { data, error } = await supabase
        .from('mentor_content')
        .select('id, title, description, content_type, created_at, file_url, external_url')
        .eq('mentor_id', profileId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    }
  });

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'image':
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const isLoading = blogsLoading || hubResourcesLoading || mentorContentLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const totalContent = blogs.length + hubResources.length + mentorContent.length;

  if (totalContent === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No content yet</h3>
        <p className="text-gray-500">This user hasn't created any content yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content Overview</h3>
        <Badge variant="outline">
          {totalContent} item{totalContent !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Blog Posts */}
        {blogs.map((blog) => (
          <Card key={`blog-${blog.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <Badge variant="outline" className="text-xs">Blog</Badge>
                </div>
                <Badge 
                  variant={blog.status === 'Published' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {blog.status}
                </Badge>
              </div>
              <CardTitle className="text-base line-clamp-2">{blog.title}</CardTitle>
              <CardDescription className="text-sm line-clamp-2">
                {blog.summary}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(blog.created_at), 'MMM d, yyyy')}
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Hub Resources */}
        {hubResources.map((resource) => (
          <Card key={`hub-${resource.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                {getIcon(resource.resource_type)}
                <Badge variant="outline" className="text-xs">Hub Resource</Badge>
              </div>
              <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
              {resource.description && (
                <CardDescription className="text-sm line-clamp-2">
                  {resource.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(resource.created_at), 'MMM d, yyyy')}
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Mentor Content */}
        {mentorContent.map((content) => (
          <Card key={`mentor-${content.id}`} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                {getIcon(content.content_type)}
                <Badge variant="outline" className="text-xs">Mentor Content</Badge>
              </div>
              <CardTitle className="text-base line-clamp-2">{content.title}</CardTitle>
              {content.description && (
                <CardDescription className="text-sm line-clamp-2">
                  {content.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(content.created_at), 'MMM d, yyyy')}
                </div>
                <Button size="sm" variant="ghost">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
