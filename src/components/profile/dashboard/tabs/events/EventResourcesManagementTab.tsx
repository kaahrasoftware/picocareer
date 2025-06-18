
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Upload, FileText, Download, Eye, Edit, Trash2, Calendar } from 'lucide-react';
import { EventResourceForm } from '@/components/event/EventResourceForm';
import { useAllEventResources } from '@/hooks/useAllEventResources';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function EventResourcesManagementTab() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  
  const { resourcesByEvent, isLoading } = useAllEventResources();
  
  // Fetch all events for the selector
  const { data: events } = useQuery({
    queryKey: ['events-for-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, start_time')
        .order('start_time', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

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

  const eventEntries = Object.entries(resourcesByEvent);
  const filteredEntries = selectedEventId === 'all' 
    ? eventEntries 
    : eventEntries.filter(([eventId]) => eventId === selectedEventId);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Event Resources Management</h3>
        <div className="flex gap-2">
          <Select value={selectedEventId} onValueChange={setSelectedEventId}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filter by event" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              {events?.map((event) => (
                <SelectItem key={event.id} value={event.id}>
                  {event.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowCreateForm(true)} disabled={selectedEventId === 'all'}>
            <Plus className="h-4 w-4 mr-2" />
            Add Resource
          </Button>
        </div>
      </div>

      {selectedEventId === 'all' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Select a specific event to add new resources. Resources are organized by event below.
          </p>
        </div>
      )}

      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No resources found</h3>
            <p className="text-muted-foreground mb-4">
              {selectedEventId === 'all' 
                ? "No event resources have been uploaded yet"
                : "No resources found for the selected event"
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredEntries.map(([eventId, { event, resources }]) => (
            <div key={eventId} className="space-y-4">
              <div className="flex items-center gap-3 border-b pb-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <h4 className="font-semibold text-lg">{event.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.start_time).toLocaleDateString()} • {event.organized_by}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto">
                  {resources.length} {resources.length === 1 ? 'resource' : 'resources'}
                </Badge>
              </div>
              
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
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && selectedEventId !== 'all' && (
        <EventResourceForm
          eventId={selectedEventId}
          onSuccess={() => setShowCreateForm(false)}
          onCancel={() => setShowCreateForm(false)}
        />
      )}
    </div>
  );
}
