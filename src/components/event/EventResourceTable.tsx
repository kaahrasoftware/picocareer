
import React, { useState } from 'react';
import { Download, Eye, Edit, Trash2, FileText, Film, Image, Link, Music, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { EventResource } from '@/types/event-resources';
import { EventResourceForm } from './EventResourceForm';
import { useEventResources } from '@/hooks/useEventResources';
import { cn } from '@/lib/utils';

interface EventResourceTableProps {
  eventId: string;
  resources: EventResource[];
}

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

const getResourceTypeColor = (type: EventResource['resource_type']) => {
  switch (type) {
    case 'video':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'audio':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'document':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'presentation':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'image':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'link':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return null;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

export function EventResourceTable({ eventId, resources }: EventResourceTableProps) {
  const { deleteResource } = useEventResources(eventId);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<EventResource | null>(null);

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

  const handleEdit = (resource: EventResource) => {
    setSelectedResource(resource);
    setEditDialogOpen(true);
  };

  const handleDelete = (resource: EventResource) => {
    setSelectedResource(resource);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedResource) {
      // Fix: Call mutate method instead of calling mutation object directly
      deleteResource.mutate(selectedResource.id);
      setDeleteDialogOpen(false);
      setSelectedResource(null);
    }
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedResource(null);
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Access</TableHead>
            <TableHead>Downloadable</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No resources found for this event.
              </TableCell>
            </TableRow>
          ) : (
            resources.map((resource) => (
              <TableRow key={resource.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      getResourceTypeColor(resource.resource_type)
                    )}>
                      {getResourceIcon(resource.resource_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium line-clamp-1">{resource.title}</div>
                      {resource.description && (
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {resource.description}
                        </div>
                      )}
                      {resource.file_size && (
                        <div className="text-xs text-muted-foreground">
                          {formatFileSize(resource.file_size)}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {resource.resource_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {resource.file_format && (
                    <span className="text-sm uppercase font-mono">
                      {resource.file_format}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={resource.access_level === 'public' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {resource.access_level === 'participants_only' 
                      ? 'Participants Only' 
                      : resource.access_level === 'registered'
                      ? 'Registered Users'
                      : 'Public'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={resource.is_downloadable ? 'default' : 'secondary'}>
                    {resource.is_downloadable ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleView(resource)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    {resource.is_downloadable && resource.file_url && (
                      <Button size="sm" variant="outline" onClick={() => handleDownload(resource)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => handleEdit(resource)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDelete(resource)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          {selectedResource && (
            <EventResourceForm 
              eventId={eventId}
              initialResource={selectedResource}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Resource</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedResource?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
