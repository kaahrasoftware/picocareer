
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Eye, 
  FileText, 
  Film, 
  Image, 
  Link, 
  Music, 
  Presentation,
  Filter,
  Grid3X3,
  List,
  Calendar,
  Clock,
  User,
  MapPin
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface EventResourcesSectionProps {
  resources: EventResource[];
  onPreview?: (resource: EventResource) => void;
  eventInfo?: {
    id: string;
    title: string;
    start_time?: string;
    end_time?: string;
    platform?: string;
    organized_by?: string;
  };
}

const getResourceIcon = (type: EventResource['resource_type']) => {
  const iconClass = "h-5 w-5";
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

const getResourceTypeColor = (type: EventResource['resource_type']) => {
  switch (type) {
    case 'video':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    case 'audio':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
    case 'document':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
    case 'presentation':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    case 'image':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    case 'link':
      return 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-300 dark:border-cyan-800';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function EventResourcesSection({ resources, onPreview, eventInfo }: EventResourcesSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);

  // Filter resources based on search and type
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (resource.description && resource.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    return matchesSearch && matchesType;
  });

  // Get unique resource types for filtering
  const resourceTypes = Array.from(new Set(resources.map(r => r.resource_type)));

  const handlePreview = (resource: EventResource) => {
    setPreviewResource(resource);
    onPreview?.(resource);
  };

  const handleDownload = (resource: EventResource) => {
    if (resource.file_url && resource.is_downloadable) {
      const link = document.createElement('a');
      link.href = resource.file_url;
      link.download = resource.title;
      link.click();
    }
  };

  const ResourceCard = ({ resource }: { resource: EventResource }) => (
    <Card className="group hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={cn(
            "p-2 rounded-lg shrink-0",
            getResourceTypeColor(resource.resource_type)
          )}>
            {getResourceIcon(resource.resource_type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1 mb-1">
              {resource.title}
            </h3>
            
            {resource.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {resource.description}
              </p>
            )}
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="text-xs capitalize">
                {resource.resource_type}
              </Badge>
              
              {resource.file_format && (
                <Badge variant="secondary" className="text-xs uppercase font-mono">
                  {resource.file_format}
                </Badge>
              )}
              
              <Badge 
                variant={resource.access_level === 'public' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {resource.access_level === 'participants_only' 
                  ? 'Participants' 
                  : resource.access_level === 'registered'
                  ? 'Registered'
                  : 'Public'}
              </Badge>
              
              {resource.file_size && (
                <span className="text-xs text-gray-500">
                  {formatFileSize(resource.file_size)}
                </span>
              )}

              {/* Event information badge */}
              {resource.events && (
                <Badge 
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  {resource.events.title}
                </Badge>
              )}
            </div>

            {/* Event date - only show if we have event info */}
            {resource.events && (
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                <Clock className="h-3 w-3" />
                {format(new Date(resource.events.start_time), 'MMM d, yyyy')}
                {resource.events.organized_by && (
                  <>
                    <span className="mx-1">•</span>
                    {resource.events.organized_by}
                  </>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(resource)}
                className="flex-1"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              {resource.is_downloadable && resource.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resource)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const ResourceListItem = ({ resource }: { resource: EventResource }) => (
    <div className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
      <div className="flex items-center gap-4">
        <div className={cn(
          "p-2 rounded-lg shrink-0",
          getResourceTypeColor(resource.resource_type)
        )}>
          {getResourceIcon(resource.resource_type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 line-clamp-1">
                {resource.title}
              </h3>
              {resource.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1 mt-1">
                  {resource.description}
                </p>
              )}

              {/* Event information for list view */}
              {resource.events && (
                <div className="flex items-center gap-2 mt-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {resource.events.title}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {format(new Date(resource.events.start_time), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="outline" className="text-xs capitalize">
                {resource.resource_type}
              </Badge>
              
              {resource.file_format && (
                <Badge variant="secondary" className="text-xs uppercase font-mono">
                  {resource.file_format}
                </Badge>
              )}
              
              <Badge 
                variant={resource.access_level === 'public' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {resource.access_level === 'participants_only' 
                  ? 'Participants' 
                  : resource.access_level === 'registered'
                  ? 'Registered'
                  : 'Public'}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              {resource.file_size && (
                <span>{formatFileSize(resource.file_size)}</span>
              )}
              {resource.is_downloadable && (
                <span className="text-green-600 dark:text-green-400">Downloadable</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePreview(resource)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              
              {resource.is_downloadable && resource.file_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(resource)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (resources.length === 0) {
    return (
      <div className="space-y-6">
        {/* Event Info Header */}
        {eventInfo && (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Calendar className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {eventInfo.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    {eventInfo.start_time && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {format(new Date(eventInfo.start_time), 'PPP p')}
                      </div>
                    )}
                    {eventInfo.platform && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {eventInfo.platform}
                      </div>
                    )}
                    {eventInfo.organized_by && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {eventInfo.organized_by}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Resources Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              There are no resources available for this event yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Event Info Header */}
      {eventInfo && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Calendar className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {eventInfo.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  {eventInfo.start_time && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(new Date(eventInfo.start_time), 'PPP p')}
                    </div>
                  )}
                  {eventInfo.platform && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {eventInfo.platform}
                    </div>
                  )}
                  {eventInfo.organized_by && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      {eventInfo.organized_by}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header with Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Event Resources
              <Badge variant="secondary" className="ml-2">
                {filteredResources.length} of {resources.length}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Type Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant={selectedType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType('all')}
            >
              All Types
            </Button>
            {resourceTypes.map(type => (
              <Button
                key={type}
                variant={selectedType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType(type)}
                className="capitalize"
              >
                {getResourceIcon(type)}
                <span className="ml-2">{type}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources Display */}
      {filteredResources.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            : "space-y-3"
        )}>
          {filteredResources.map((resource) => (
            viewMode === 'grid' ? (
              <ResourceCard key={resource.id} resource={resource} />
            ) : (
              <ResourceListItem key={resource.id} resource={resource} />
            )
          ))}
        </div>
      )}

      {/* Preview Modal */}
      <ResourcePreviewModal
        resource={previewResource}
        isOpen={!!previewResource}
        onClose={() => setPreviewResource(null)}
      />
    </div>
  );
}
