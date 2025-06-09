import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Upload, FileText, Download, Eye, BarChart3 } from 'lucide-react';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import { EventResourceMetrics } from './EventResourceMetrics';
import { ModernResourceAnalytics } from './ModernResourceAnalytics';
import { useEventResourcesQuery } from '@/hooks/useEventResourcesQuery';

interface EventResourcesManagementTabProps {
  eventId: string;
}

export function EventResourcesManagementTab({ eventId }: EventResourcesManagementTabProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  
  const { data: resources = [], isLoading } = useEventResourcesQuery(eventId);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'video': return <FileText className="h-4 w-4" />;
      case 'link': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div>Loading resources...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Event Resources</h3>
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

        <TabsContent value="resources" className="space-y-4">
          {resources.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No resources yet</h3>
                <p className="text-muted-foreground mb-4">
                  Add your first resource to share with event attendees
                </p>
                <Button onClick={() => setShowCreateForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Resource
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {resources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getResourceIcon(resource.resource_type)}
                        <div>
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {resource.resource_type}
                        </Badge>
                        <Badge variant={resource.access_level === 'public' ? 'default' : 'secondary'}>
                          {resource.access_level}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {resource.view_count || 0} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {resource.download_count || 0} downloads
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedResource(resource)}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <ModernResourceAnalytics />
        </TabsContent>

        <TabsContent value="metrics">
          <EventResourceMetrics />
        </TabsContent>
      </Tabs>

      {showCreateForm && (
        <EventResourceForm
          eventId={eventId}
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
