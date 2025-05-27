
import { useState } from 'react';
import { EventResourceCard } from './EventResourceCard';
import { ResourceLoadingSkeleton } from './ResourceLoadingSkeleton';
import { ResourcePreviewModal } from './ResourcePreviewModal';
import { EventResource } from '@/types/event-resources';
import { Search, Filter, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventResourcesSectionProps {
  resources: (EventResource & {
    events?: {
      id: string;
      title: string;
      start_time: string;
      organized_by?: string;
    };
  })[];
  isLoading?: boolean;
  eventInfo?: {
    id: string;
    title: string;
    organized_by?: string;
  };
}

export function EventResourcesSection({ 
  resources = [], 
  isLoading = false,
  eventInfo 
}: EventResourcesSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);

  console.log('📋 EventResourcesSection rendered with:', {
    resourcesCount: resources.length,
    isLoading,
    eventInfo,
    firstResourceId: resources[0]?.id
  });

  if (isLoading) {
    return <ResourceLoadingSkeleton />;
  }

  // Filter resources based on search and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch = !searchTerm || 
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    const matchesAccessLevel = selectedAccessLevel === 'all' || resource.access_level === selectedAccessLevel;
    
    return matchesSearch && matchesType && matchesAccessLevel;
  });

  // Get unique resource types and access levels for filters
  const uniqueTypes = [...new Set(resources.map(r => r.resource_type))];
  const uniqueAccessLevels = [...new Set(resources.map(r => r.access_level))];

  const handleResourceView = (resource: EventResource) => {
    console.log('👁️ Resource view requested:', resource.id, resource.title);
    setPreviewResource(resource);
  };

  const handleResourceDownload = (resource: EventResource) => {
    console.log('⬇️ Resource download completed:', resource.id, resource.title);
    // The tracking is handled within the EventResourceCard component
  };

  if (filteredResources.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {searchTerm || selectedType !== 'all' || selectedAccessLevel !== 'all' 
            ? 'No matching resources found' 
            : 'No resources available'}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchTerm || selectedType !== 'all' || selectedAccessLevel !== 'all'
            ? 'Try adjusting your filters to see more resources.'
            : eventInfo 
              ? `No resources have been uploaded for ${eventInfo.title} yet.`
              : 'No event resources have been uploaded yet.'}
        </p>
        {(searchTerm || selectedType !== 'all' || selectedAccessLevel !== 'all') && (
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedAccessLevel('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with event info */}
      {eventInfo && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">{eventInfo.title} Resources</h2>
          {eventInfo.organized_by && (
            <p className="text-muted-foreground">
              Organized by {eventInfo.organized_by}
            </p>
          )}
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {uniqueTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedAccessLevel} onValueChange={setSelectedAccessLevel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Access Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access</SelectItem>
              {uniqueAccessLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level === 'participants_only' ? 'Participants Only' : 
                   level === 'registered' ? 'Registered Users' : 'Public'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="hidden sm:block">
            {filteredResources.length} resources
          </Badge>
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resources Grid/List */}
      <div className={
        viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
      }>
        {filteredResources.map((resource) => (
          <EventResourceCard
            key={resource.id}
            resource={resource}
            onView={handleResourceView}
            onDownload={handleResourceDownload}
          />
        ))}
      </div>

      {/* Preview Modal */}
      {previewResource && (
        <ResourcePreviewModal
          resource={previewResource}
          isOpen={!!previewResource}
          onClose={() => setPreviewResource(null)}
        />
      )}
    </div>
  );
}
