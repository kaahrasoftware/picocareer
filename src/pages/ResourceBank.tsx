
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Eye, FileText, Film, Image, Link, Music, Presentation } from "lucide-react";
import { EventResource } from "@/types/event-resources";

const getResourceIcon = (type: EventResource['resource_type']) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case 'video':
      return <Film className={iconClass} />;
    case 'audio':
      return <Music className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    case 'presentation':
      return <Presentation className={iconClass} />;
    case 'image':
      return <Image className={iconClass} />;
    case 'link':
      return <Link className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export default function ResourceBank() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const { data: allResources, isLoading, error } = useQuery({
    queryKey: ['all-event-resources'],
    queryFn: async (): Promise<EventResource[]> => {
      const { data, error } = await supabase
        .from('event_resources')
        .select(`
          *,
          event:events(title, start_time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const filteredResources = allResources?.filter(resource => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || resource.resource_type === selectedType;

    return matchesSearch && matchesType;
  });

  const resourceTypes = Array.from(new Set(allResources?.map(r => r.resource_type) || []));

  const handleView = (resource: EventResource) => {
    if (resource.external_url) {
      window.open(resource.external_url, '_blank');
    } else if (resource.file_url) {
      window.open(resource.file_url, '_blank');
    }
  };

  const handleDownload = (resource: EventResource) => {
    if (resource.file_url && resource.is_downloadable) {
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      link.click();
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Error Loading Resources</h2>
          <p className="text-muted-foreground">There was an error loading the resources. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Resource Bank</h1>
        <p className="text-muted-foreground">
          Discover and access educational resources from all our events
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full md:w-auto">
          <TabsList>
            <TabsTrigger value="all">All Types</TabsTrigger>
            {resourceTypes.map(type => (
              <TabsTrigger key={type} value={type} className="capitalize">
                {type}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-muted rounded w-full"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredResources && filteredResources.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {getResourceIcon(resource.resource_type)}
                    <CardTitle className="text-lg line-clamp-2">{resource.title}</CardTitle>
                  </div>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {resource.resource_type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {resource.description && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resource.description}
                    </p>
                  )}
                  
                  {resource.event && (
                    <div className="text-xs text-muted-foreground">
                      From: {resource.event.title}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {resource.view_count || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        {resource.download_count || 0}
                      </div>
                    </div>
                    {resource.file_size && (
                      <span>{formatFileSize(resource.file_size)}</span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(resource)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    {resource.is_downloadable && resource.file_url && (
                      <Button size="sm" variant="outline" onClick={() => handleDownload(resource)}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No resources found</h3>
          <p className="text-muted-foreground">
            {searchQuery || selectedType !== "all" 
              ? "Try adjusting your search or filter criteria."
              : "No resources have been added yet."}
          </p>
        </div>
      )}
    </div>
  );
}
