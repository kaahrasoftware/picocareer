
import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEventResources } from "@/hooks/useEventResources";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EventResourceCard } from "./EventResourceCard";
import { EventResourceForm } from "./EventResourceForm";
import { EventResource } from "@/types/event-resources";

interface EventResourcesSectionProps {
  eventId: string;
}

export function EventResourcesSection({ eventId }: EventResourcesSectionProps) {
  const { session } = useAuthSession();
  const { data: profile } = useUserProfile(session);
  const { resources, isLoading, deleteResource } = useEventResources(eventId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<EventResource | null>(null);

  const isAdmin = profile?.user_type === 'admin';
  const canManageResources = isAdmin; // Could extend this logic for event authors

  const handleEdit = (resource: EventResource) => {
    setEditingResource(resource);
    setIsFormOpen(true);
  };

  const handleDelete = (resource: EventResource) => {
    if (confirm('Are you sure you want to delete this resource?')) {
      deleteResource(resource.id);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingResource(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Event Resources</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading resources...</p>
        </div>
      </div>
    );
  }

  if (!resources || resources.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Event Resources</h3>
          {canManageResources && (
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Resource
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add Event Resource</DialogTitle>
                </DialogHeader>
                <EventResourceForm 
                  eventId={eventId} 
                  onSuccess={handleFormClose}
                  onCancel={handleFormClose}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium mb-2">No Resources Available</h4>
          <p className="text-muted-foreground">
            {canManageResources 
              ? "Start by adding some resources for this event."
              : "Resources will appear here when they become available."
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Event Resources</h3>
        {canManageResources && (
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingResource ? 'Edit Resource' : 'Add Event Resource'}
                </DialogTitle>
              </DialogHeader>
              <EventResourceForm 
                eventId={eventId} 
                initialResource={editingResource}
                onSuccess={handleFormClose}
                onCancel={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource) => (
          <EventResourceCard 
            key={resource.id}
            resource={resource}
            showActions={canManageResources}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
