
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, Search, Filter, Grid, List, FileText, Film, Image, Link, Music, Presentation } from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { EventResourceCard } from './EventResourceCard';
import { useResourceTracking } from '@/hooks/useResourceTracking';
import { useToast } from '@/hooks/use-toast';

interface EventResourcesSectionProps {
  resources: EventResource[];
  isLoading?: boolean;
}

const resourceTypeIcons = {
  video: Film,
  audio: Music,
  document: FileText,
  presentation: Presentation,
  image: Image,
  link: Link,
} as const;

export function EventResourcesSection({ resources = [], isLoading = false }: EventResourcesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);
  
  const { trackView, trackDownload } = useResourceTracking();
  const { toast } = useToast();

  const handlePreview = (resource: EventResource) => {
    console.log('🎯 EventResourcesSection: Handling preview for resource:', resource.id);
    
    // Track the view action
    trackView(resource.id, {
      source: 'event_resources_section',
      action: 'preview_button_click',
      resource_type: resource.resource_type,
      resource_title: resource.title,
      has_external_url: !!resource.external_url,
      has_file_url: !!resource.file_url
    });

    setPreviewResource(resource);
  };

  const handleDownload = async (resource: EventResource) => {
    console.log('🎯 EventResourcesSection: Handling download for resource:', resource.id);
    
    if (!resource.file_url || !resource.is_downloadable) {
      toast({
        title: "Download not available",
        description: "This resource cannot be downloaded.",
        variant: "destructive"
      });
      return;
    }

    // Track the download action
    trackDownload(resource.id, {
      source: 'event_resources_section',
      action: 'download_button_click',
      resource_type: resource.resource_type,
      resource_title: resource.title,
      file_size: resource.file_size,
      file_format: resource.file_format,
      download_method: 'section_direct'
    });

    try {
      const safeTitle = resource.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileExtension = resource.file_format ? `.${resource.file_format.toLowerCase()}` : '';
      const fileName = `${safeTitle}${fileExtension}`;
      
      const response = await fetch(resource.file_url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: `${resource.title} is being downloaded.`
      });
      
    } catch (error) {
      console.error('Download failed:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    return matchesSearch && matchesType;
  });

  const resourceTypes = [...new Set(resources.map(r => r.resource_type))];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Event Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const ResourceListItem = ({ resource }: { resource: EventResource }) => {
    const IconComponent = resourceTypeIcons[resource.resource_type as keyof typeof resourceTypeIcons] || FileText;
    
    return (
      <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          <IconComponent className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{resource.title}</h3>
          {resource.description && (
            <p className="text-sm text-muted-foreground truncate">{resource.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              {resource.resource_type}
            </Badge>
            {resource.file_format && (
              <span className="text-xs text-muted-foreground uppercase">
                {resource.file_format}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => handlePreview(resource)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          {resource.is_downloadable && resource.file_url && (
            <Button size="sm" onClick={() => handleDownload(resource)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Event Resources</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {resourceTypes.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {filteredResources.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                {searchTerm || selectedType !== 'all' ? 'No resources found' : 'No resources available'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {searchTerm || selectedType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Resources will appear here when they are added to this event.'
                }
              </p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.map((resource) => (
                    <EventResourceCard
                      key={resource.id}
                      resource={resource}
                      onView={handlePreview}
                      onDownload={handleDownload}
                      onPreview={handlePreview}
                      showActions={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredResources.map((resource) => (
                    <ResourceListItem key={resource.id} resource={resource} />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </>
  );
}
