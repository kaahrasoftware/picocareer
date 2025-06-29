
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, BarChart3 } from 'lucide-react';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import { EventResourcesDataTable } from '@/components/event/EventResourcesDataTable';
import { ResourceFilters } from '@/components/event/ResourceFilters';
import { ResourceStats } from '@/components/event/ResourceStats';
import { EventResourceMetrics } from './EventResourceMetrics';
import { ModernResourceAnalytics } from './ModernResourceAnalytics';
import { useEventResources } from '@/hooks/useEventResources';
import { EventResource } from '@/types/event-resources';

interface EventResourcesManagementTabProps {
  eventId: string;
}

export function EventResourcesManagementTab({ eventId }: EventResourcesManagementTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EventResource | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedAccess, setSelectedAccess] = useState('all');
  
  const { resources = [], isLoading } = useEventResources(eventId);

  // Filter resources based on search and filters
  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.description?.toLowerCase() || '').includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || resource.resource_type === selectedType;
    const matchesAccess = selectedAccess === 'all' || resource.access_level === selectedAccess;

    return matchesSearch && matchesType && matchesAccess;
  });

  const handleEdit = (resource: EventResource) => {
    setSelectedResource(resource);
    setShowEditForm(true);
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setSelectedResource(null);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export resources');
  };

  const handleBulkUpload = () => {
    // TODO: Implement bulk upload functionality
    console.log('Bulk upload resources');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading resources...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Event Resources</h3>
          <p className="text-sm text-muted-foreground">
            Manage and track resources for your event
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      <Tabs defaultValue="resources" className="w-full">
        <TabsList>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-6">
          <ResourceStats resources={resources} />
          
          <ResourceFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            selectedAccess={selectedAccess}
            onAccessChange={setSelectedAccess}
            onExport={handleExport}
            onBulkUpload={handleBulkUpload}
          />

          {filteredResources.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">
                  {resources.length === 0 ? 'No resources yet' : 'No resources match your filters'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {resources.length === 0 
                    ? 'Add your first resource to share with event attendees'
                    : 'Try adjusting your search or filter criteria'
                  }
                </p>
                {resources.length === 0 && (
                  <Button onClick={() => setShowCreateForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Resource
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <EventResourcesDataTable
              eventId={eventId}
              resources={filteredResources}
              onEdit={handleEdit}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <ModernResourceAnalytics />
        </TabsContent>

        <TabsContent value="metrics">
          <EventResourceMetrics />
        </TabsContent>
      </Tabs>

      {/* Create Resource Dialog */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Resource</DialogTitle>
          </DialogHeader>
          <EventResourceForm
            eventId={eventId}
            onSuccess={handleFormSuccess}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Resource Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <EventResourceForm
              eventId={eventId}
              initialResource={selectedResource}
              onSuccess={handleFormSuccess}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
