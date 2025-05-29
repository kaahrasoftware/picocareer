
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PlusCircle, Calendar, Search, Grid3X3, List, Filter } from 'lucide-react';
import { EventResourceTable } from '@/components/event/EventResourceTable';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import { EventSelector } from './EventSelector';
import { MobileEventResourceCard } from '@/components/event/MobileEventResourceCard';
import { MobileResourceStats } from '@/components/event/MobileResourceStats';
import { ResourcePreviewModal } from '@/components/event/ResourcePreviewModal';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useEventResources } from '@/hooks/useEventResources';
import { useEvents } from '@/hooks/useEvents';
import { EventResource } from '@/types/event-resources';

interface EventResourcesManagementTabProps {
  eventId?: string;
}

export const EventResourcesManagementTab: React.FC<EventResourcesManagementTabProps> = ({ eventId: initialEventId }) => { 
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [selectedEventId, setSelectedEventId] = useState(initialEventId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewResource, setPreviewResource] = useState<EventResource | null>(null);
  const { isMobile, isTablet } = useMobileDetection();

  // Fetch events for the selector
  const { events, registrationCounts, isLoading: eventsLoading } = useEvents();

  // Fetch resources for the selected event
  const { resources, isLoading: resourcesLoading } = useEventResources(selectedEventId);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleResourceView = (resource: EventResource) => {
    setPreviewResource(resource);
  };

  const handleResourceDownload = (resource: EventResource) => {
    if (resource.file_url) {
      window.open(resource.file_url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter resources based on search and type
  const filteredResources = React.useMemo(() => {
    if (!resources) return [];
    
    return resources.filter(resource => {
      const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (resource.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      const matchesType = filterType === 'all' || resource.resource_type === filterType;
      
      return matchesSearch && matchesType;
    });
  }, [resources, searchQuery, filterType]);

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!resources) return { totalResources: 0, totalViews: 0, totalDownloads: 0, uniqueViewers: 0 };
    
    return {
      totalResources: resources.length,
      totalViews: resources.reduce((sum, r) => sum + (r.view_count || 0), 0),
      totalDownloads: resources.reduce((sum, r) => sum + (r.download_count || 0), 0),
      uniqueViewers: resources.reduce((sum, r) => sum + (r.unique_viewers || 0), 0),
    };
  }, [resources]);

  const selectedEvent = events?.find(event => event.id === selectedEventId);

  // Get unique resource types for filter
  const resourceTypes = React.useMemo(() => {
    if (!resources) return [];
    return Array.from(new Set(resources.map(r => r.resource_type)));
  }, [resources]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Event Selector Section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Calendar className="h-5 w-5" />
            Select Event
          </CardTitle>
          <CardDescription className="text-sm">
            Choose an event to manage its resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventSelector
            events={events || []}
            selectedEvent={selectedEventId}
            onEventChange={handleEventChange}
            registrationCounts={registrationCounts}
            isLoading={eventsLoading}
          />
        </CardContent>
      </Card>

      {/* Selected Event Info & Actions */}
      {selectedEvent && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <CardTitle className="text-lg md:text-xl break-words">
                  {selectedEvent.title}
                </CardTitle>
                <CardDescription className="text-sm">
                  {selectedEvent.start_time && new Date(selectedEvent.start_time).toLocaleDateString()} • {selectedEvent.location || 'Virtual'}
                </CardDescription>
              </div>
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full md:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" /> 
                    {isMobile ? 'Add Resource' : 'Add New Resource'}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Resource</DialogTitle>
                  </DialogHeader>
                  <EventResourceForm eventId={selectedEventId} onSuccess={() => setIsFormOpen(false)} />
                </DialogContent> 
              </Dialog>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Resources Section */}
      {selectedEventId ? (
        <>
          {resourcesLoading ? (
            <Card className="w-full text-center py-8">
              <CardContent>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading resources...</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats - Mobile optimized */}
              {resources && resources.length > 0 && (
                <MobileResourceStats {...stats} />
              )}

              {/* Search and Filters - Mobile optimized */}
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
                    {/* Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-11"
                      />
                    </div>
                    
                    {/* Filters */}
                    <div className="flex gap-2 md:gap-3">
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-32 h-11">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          {resourceTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      {/* View mode toggle - hidden on mobile */}
                      {!isMobile && (
                        <div className="flex border rounded-lg">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none h-11 px-3"
                          >
                            <Grid3X3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none h-11 px-3"
                          >
                            <List className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Resources Display */}
              <Card>
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Event Resources</CardTitle>
                  <CardDescription>
                    {filteredResources.length} of {resources?.length || 0} resources
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredResources.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No Resources Found
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {searchQuery || filterType !== 'all'
                          ? 'Try adjusting your search or filter criteria.'
                          : 'This event doesn\'t have any resources yet.'}
                      </p>
                      {!searchQuery && filterType === 'all' && (
                        <Button onClick={() => setIsFormOpen(true)}>
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add First Resource
                        </Button>
                      )}
                    </div>
                  ) : (
                    <>
                      {/* Mobile: Always use card layout */}
                      {(isMobile || isTablet) ? (
                        <div className="space-y-4">
                          {filteredResources.map((resource) => (
                            <MobileEventResourceCard
                              key={resource.id}
                              resource={resource}
                              onView={handleResourceView}
                              onDownload={handleResourceDownload}
                            />
                          ))}
                        </div>
                      ) : (
                        /* Desktop: Use selected view mode */
                        viewMode === 'grid' ? (
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {filteredResources.map((resource) => (
                              <MobileEventResourceCard
                                key={resource.id}
                                resource={resource}
                                onView={handleResourceView}
                                onDownload={handleResourceDownload}
                              />
                            ))}
                          </div>
                        ) : (
                          <EventResourceTable 
                            eventId={selectedEventId}
                            resources={filteredResources}
                          />
                        )
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      ) : (
        <Card className="w-full text-center py-12">
          <CardHeader>
            <CardTitle>Select an Event</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Please select an event from the dropdown above to view and manage its resources.
            </CardDescription>
          </CardContent>
        </Card>
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
