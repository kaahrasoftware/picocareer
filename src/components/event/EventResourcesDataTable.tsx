
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileText, 
  Film, 
  Image, 
  Link, 
  Music, 
  Presentation,
  Archive,
  Copy,
  Share
} from 'lucide-react';
import { EventResource } from '@/types/event-resources';
import { useEventResources } from '@/hooks/useEventResources';
import { cn } from '@/lib/utils';

interface EventResourcesDataTableProps {
  eventId: string;
  resources: EventResource[];
  onEdit: (resource: EventResource) => void;
}

const getResourceIcon = (type: EventResource['resource_type']) => {
  const iconClass = "h-4 w-4";
  switch (type) {
    case 'video': return <Film className={iconClass} />;
    case 'audio': return <Music className={iconClass} />;
    case 'document': return <FileText className={iconClass} />;
    case 'presentation': return <Presentation className={iconClass} />;
    case 'image': return <Image className={iconClass} />;
    case 'link': return <Link className={iconClass} />;
    default: return <Archive className={iconClass} />;
  }
};

const getResourceTypeColor = (type: EventResource['resource_type']) => {
  switch (type) {
    case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'audio': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
    case 'document': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    case 'presentation': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'image': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'link': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  }
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return 'N/A';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export function EventResourcesDataTable({ 
  eventId, 
  resources, 
  onEdit 
}: EventResourcesDataTableProps) {
  const { deleteResource } = useEventResources(eventId);

  const handleView = (resource: EventResource) => {
    const url = resource.external_url || resource.file_url;
    if (url) {
      window.open(url, '_blank');
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

  const handleDelete = (resource: EventResource) => {
    if (confirm(`Are you sure you want to delete "${resource.title}"?`)) {
      deleteResource(resource.id);
    }
  };

  const handleDuplicate = (resource: EventResource) => {
    // TODO: Implement duplication logic
    console.log('Duplicate resource:', resource.id);
  };

  const handleShare = (resource: EventResource) => {
    const url = resource.external_url || resource.file_url;
    if (url && navigator.share) {
      navigator.share({
        title: resource.title,
        text: resource.description,
        url: url
      });
    } else if (url) {
      navigator.clipboard.writeText(url);
      // TODO: Show toast notification
    }
  };

  const columns: ColumnDef<EventResource>[] = [
    {
      accessorKey: 'title',
      header: 'Resource',
      cell: ({ row }) => {
        const resource = row.original;
        return (
          <div className="flex items-center gap-3 min-w-0">
            <div className={cn(
              "p-2 rounded-lg flex-shrink-0",
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
              <div className="flex items-center gap-2 mt-1">
                {resource.file_size && (
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(resource.file_size)}
                  </span>
                )}
                {resource.file_format && (
                  <Badge variant="outline" className="text-xs">
                    {resource.file_format.toUpperCase()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'resource_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {row.getValue('resource_type')}
        </Badge>
      ),
    },
    {
      accessorKey: 'access_level',
      header: 'Access',
      cell: ({ row }) => {
        const accessLevel = row.getValue('access_level') as string;
        return (
          <Badge 
            variant={accessLevel === 'public' ? 'default' : 'secondary'}
            className="text-xs"
          >
            {accessLevel === 'participants_only' 
              ? 'Participants' 
              : accessLevel === 'registered'
              ? 'Registered'
              : 'Public'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_downloadable',
      header: 'Download',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_downloadable') ? 'default' : 'secondary'}>
          {row.getValue('is_downloadable') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
    {
      id: 'engagement',
      header: 'Engagement',
      cell: ({ row }) => {
        const resource = row.original;
        const views = resource.view_count || 0;
        const downloads = resource.download_count || 0;
        return (
          <div className="text-sm space-y-1">
            <div className="flex items-center gap-2">
              <Eye className="h-3 w-3" />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-2">
              <Download className="h-3 w-3" />
              <span>{downloads}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.getValue('created_at'))}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const resource = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => handleView(resource)}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              {resource.is_downloadable && resource.file_url && (
                <DropdownMenuItem onClick={() => handleDownload(resource)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => handleShare(resource)}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicate(resource)}>
                <Copy className="h-4 w-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDelete(resource)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={resources} />
    </div>
  );
}
