
import { useState } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useEventResources } from "@/hooks/useEventResources";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EventResourceCard } from "./EventResourceCard";
import { EventResourceForm } from "./EventResourceForm";
import { EventResource } from "@/types/event-resources";

interface EventResourcesSectionProps {
 eventId?: string; // Make eventId optional
 resources?: EventResource[]; // Add optional resources prop
 onPreview?: (resource: EventResource) => void;
}

export function EventResourcesSection({ eventId, resources: resourcesProp, onPreview }: EventResourcesSectionProps) {
  const { session } = useAuthSession(); // Add onPreview prop
  const { data: profile } = useUserProfile(session);

  // Use provided resources if available, otherwise fetch by eventId
  const { resources: fetchedResources, isLoading, deleteResource } = useEventResources(eventId);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [previewingResource, setPreviewingResource] = useState<EventResource | null>(null);
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

  const resources = resourcesProp || fetchedResources;

  const handleFormClose = () => {
    console.log('handleFormClose called'); // Added console.log
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

  if (!resources || resources.length === 0) { // Check the combined resources
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Event Resources</h3>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {resources.map((resource) => (
          <EventResourceCard 
            key={resource.id}
            resource={resource}
            showActions={canManageResources}
            onPreview={onPreview ? onPreview : setPreviewingResource}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
      </div>

      {previewingResource && (
        <div className="relative p-4 border rounded-lg shadow-sm bg-muted/30 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-semibold">{previewingResource.title}</h4>
            <Button variant="ghost" size="sm" onClick={() => setPreviewingResource(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {previewingResource.description && (
            <p className="text-sm text-muted-foreground">{previewingResource.description}</p>
          )}
          {/* Resource Preview */}
          {(previewingResource.resource_type === 'video' && (previewingResource.external_url || previewingResource.file_url)) && (
            <div className="text-center py-4">
              <Button variant="outline" asChild><a href={previewingResource.external_url || previewingResource.file_url} target="_blank" rel="noopener noreferrer">Watch Video in new tab</a></Button>
            </div>
          )}
          {previewingResource.resource_type === 'document' && (previewingResource.external_url || previewingResource.file_url) && (
            <div className="relative" style={{ paddingBottom: 'calc(90vh - 100px)', height: 0 }}>
              <iframe
                src={previewingResource.external_url || previewingResource.file_url}
                title={previewingResource.title}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              ></iframe>
            </div>
          )}
          {/* Start Fallback for other types with URLs */}
          {(previewingResource.resource_type !== 'video' && previewingResource.resource_type !== 'document') && (previewingResource.external_url || previewingResource.file_url) ? (

            <Button variant="outline" asChild><a href={previewingResource.external_url || previewingResource.file_url} target="_blank" rel="noopener noreferrer">View Resource in new tab</a></Button>
          ) : null /* Added null for the else case of the ternary operator */}
        {/* End Fallback for other types with URLs */}
        </div>
      )}
    </div>
  );
}
